<?php

namespace App\Controller;

use App\Entity\Url;
use App\Entity\User;
use App\Service\UrlShortener;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use App\Message\UrlClickedMessage;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

#[Route('/api')]
class UrlController extends AbstractController
{
    public function __construct(
        private UrlShortener $shortener,
        private EntityManagerInterface $entityManager
    ) {}

    /**
    *POST /api/urls - Create link with Alias, Visibility, and Expiration
     */
    #[Route('/urls', methods: ['POST'])]
    public function create(
        Request $request,
        RateLimiterFactoryInterface $urlCreationLimiter
    ): JsonResponse {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        // Rate Limit: max 10/min
        $limiter = $urlCreationLimiter->create((string)$user->getId());
        if (false === $limiter->consume(1)->isAccepted()) {
            throw new TooManyRequestsHttpException(null, 'Rate limit exceeded: Max 10 per minute.');
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['longUrl'])) {
            return $this->json(['error' => 'Missing longUrl field'], 400);
        }

        $url = new Url();
        $url->setLongUrl($data['longUrl']);
        $url->setOwner($user);
        $url->setClickCount(0);
        $url->setCreatedAt(new \DateTimeImmutable());

        // 1. Visibility
        $url->setIsPublic($data['isPublic'] ?? true);

        // 2. Custom Alias Logic
        if (!empty($data['alias'])) {
            $existing = $this->entityManager->getRepository(Url::class)->findOneBy(['shortCode' => $data['alias']]);
            if ($existing) {
                return $this->json(['error' => 'Alias already taken'], 409);
            }
            $url->setShortCode($data['alias']);
        } else {
            $url->setShortCode($this->shortener->generateUniqueCode());
        }

        // 3. Expiration Logic (1h, 1d, 1w)
        if (!empty($data['expiresIn'])) {
            $interval = match ($data['expiresIn']) {
                '1h' => 'PT1H',
                '1d' => 'P1D',
                '1w' => 'P7D',
                default => null
            };
            if ($interval) {
                $url->setExpiresAt((new \DateTimeImmutable())->add(new \DateInterval($interval)));
            }
        }

        $this->entityManager->persist($url);
        $this->entityManager->flush();

        return $this->json([
            'id' => $url->getId(),
            'shortCode' => $url->getShortCode(),
            'longUrl' => $url->getLongUrl(),
            'expiresAt' => $url->getExpiresAt()?->format(\DateTimeInterface::ATOM)
        ], 201);
    }

    /**
     *GET /api/public - List all public links (No Auth Required)
     */
    #[Route('/public', methods: ['GET'])]
    public function publicList(): JsonResponse
    {
        $now = new \DateTimeImmutable();
        $urls = $this->entityManager->getRepository(Url::class)
            ->createQueryBuilder('u')
            ->where('u.isPublic = :public')
            ->andWhere('u.deletedAt IS NULL')
            ->andWhere('u.expiresAt IS NULL OR u.expiresAt > :now')
            ->setParameter('public', true)
            ->setParameter('now', $now)
            ->orderBy('u.createdAt', 'DESC')
            ->setMaxResults(50)
            ->getQuery()
            ->getResult();

        $data = array_map(fn($u) => [
            'shortCode' => $u->getShortCode(),
            'longUrl' => $u->getLongUrl(),
            'clickCount' => $u->getClickCount(),
            'createdAt' => $u->getCreatedAt()->format('Y-m-d H:i')
        ], $urls);

        return $this->json($data);
    }

    /**
     *GET /api/urls/{id}/stats - Click statistics
     */
    #[Route('/urls/{id}/stats', methods: ['GET'])]
    public function stats(int $id): JsonResponse
    {
        $url = $this->entityManager->getRepository(Url::class)->find($id);

        if (!$url || $url->getOwner() !== $this->getUser()) {
            return $this->json(['error' => 'Forbidden'], 403);
        }

        return $this->json([
            'id' => $url->getId(),
            'shortCode' => $url->getShortCode(),
            'clickCount' => $url->getClickCount(),
            'createdAt' => $url->getCreatedAt()->format('Y-m-d H:i:s'),
            'expiresAt' => $url->getExpiresAt()?->format('Y-m-d H:i:s')
        ]);
    }

    /**
     *GET /{shortCode} - Redirection with Expiration Check
     */
    #[Route('/urls/{code}', methods: ['GET'])]
    public function show(string $code, MessageBusInterface $bus): JsonResponse
    {
        $url = $this->entityManager->getRepository(Url::class)->findOneBy([
            'shortCode' => $code,
            'deletedAt' => null
        ]);

        // Check if URL exists and is not expired
        if (!$url || ($url->getExpiresAt() && $url->getExpiresAt() < new \DateTimeImmutable())) {
            return $this->json(['error' => 'URL not found or expired'], 404);
        }

        $bus->dispatch(new UrlClickedMessage($url->getId()));

        return $this->json([
            'id' => $url->getId(),
            'longUrl' => $url->getLongUrl(),
            'shortCode' => $url->getShortCode(),
            'clickCount' => $url->getClickCount(),
        ]);
    }

    #[Route('/urls', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) return $this->json(['error' => 'Unauthorized'], 401);

        $urls = $this->entityManager->getRepository(Url::class)->findBy(
            ['owner' => $user, 'deletedAt' => null],
            ['createdAt' => 'DESC']
        );

        $data = array_map(fn($u) => [
            'id' => $u->getId(),
            'shortCode' => $u->getShortCode(),
            'longUrl' => $u->getLongUrl(),
            'clickCount' => $u->getClickCount(),
            'isPublic' => $u->isPublic(),
            'createdAt' => $u->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $urls);

        return $this->json($data);
    }

    #[Route('/urls/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        $url = $this->entityManager->getRepository(Url::class)->find($id);

        if (!$url || $url->getOwner() !== $user) {
            return $this->json(['error' => 'URL not found or access denied'], 404);
        }

        $url->setDeletedAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json(['message' => 'Url deleted successfully']);
    }
}
