<?php

namespace App\Controller;

use App\Repository\SessionRepository;
use App\Repository\UrlRepository;
use App\Service\UrlShortenerService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UrlController extends AbstractController
{
    public function __construct(
        private UrlShortenerService $urlShortenerService,
        private UrlRepository $urlRepository,
        private SessionRepository $sessionRepository,
        private JWTTokenManagerInterface $jwtManager,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('/api/urls', name: 'api_urls_create', methods: ['POST'])]
    public function createUrl(Request $request): JsonResponse
    {
        $session = $this->getSessionFromToken($request);
        if (!$session) {
            return $this->json(['error' => 'Invalid or missing token'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['url'])) {
            return $this->json(['error' => 'URL is required'], Response::HTTP_BAD_REQUEST);
        }

        $visibility = $data['visibility'] ?? 'public';
        $expiresIn = $data['expiresIn'] ?? null;

        if (!in_array($visibility, ['public', 'private'])) {
            return $this->json(['error' => 'Visibility must be public or private'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $url = $this->urlShortenerService->createShortUrl(
                $data['url'],
                $session,
                $visibility,
                $expiresIn
            );

            $baseUrl = $request->getSchemeAndHttpHost();

            return $this->json([
                'id' => $url->getId(),
                'originalUrl' => $url->getOriginalUrl(),
                'shortCode' => $url->getShortCode(),
                'shortUrl' => $baseUrl . '/' . $url->getShortCode(),
                'visibility' => $url->getVisibility(),
                'createdAt' => $url->getCreatedAt()->format('c'),
                'expiresAt' => $url->getExpiresAt()?->format('c'),
                'clickCount' => $url->getClickCount()
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to create short URL'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/urls', name: 'api_urls_list', methods: ['GET'])]
    public function listUrls(Request $request): JsonResponse
    {
        $session = $this->getSessionFromToken($request);
        if (!$session) {
            return $this->json(['error' => 'Invalid or missing token'], Response::HTTP_UNAUTHORIZED);
        }

        $visibility = $request->query->get('visibility');

        if ($visibility !== null && !in_array($visibility, ['public', 'private'])) {
            return $this->json(['error' => 'Visibility must be public or private'], Response::HTTP_BAD_REQUEST);
        }

        $urls = $this->urlRepository->findBySessionAndVisibility($session, $visibility);

        $baseUrl = $request->getSchemeAndHttpHost();

        $data = array_map(function ($url) use ($baseUrl) {
            return [
                'id' => $url->getId(),
                'originalUrl' => $url->getOriginalUrl(),
                'shortCode' => $url->getShortCode(),
                'shortUrl' => $baseUrl . '/' . $url->getShortCode(),
                'visibility' => $url->getVisibility(),
                'createdAt' => $url->getCreatedAt()->format('c'),
                'expiresAt' => $url->getExpiresAt()?->format('c'),
                'clickCount' => $url->getClickCount(),
                'isExpired' => $url->isExpired()
            ];
        }, $urls);

        return $this->json($data);
    }

    private function getSessionFromToken(Request $request): ?\App\Entity\Session
    {
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = substr($authHeader, 7);

        try {
            $payload = $this->jwtManager->parse($token);
            $sessionToken = $payload['username'] ?? null;

            if (!$sessionToken) {
                return null;
            }

            return $this->sessionRepository->findByToken($sessionToken);
        } catch (\Exception $e) {
            return null;
        }
    }
}
