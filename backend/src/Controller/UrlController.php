<?php

namespace App\Controller;

use App\Entity\Url;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\UrlRepository;
use App\Service\UrlShortener;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class UrlController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UrlShortener $shortener,
        private UserRepository $userRepository
    ) {}

    // 1. CREATE SHORT LINK (POST)
    #[Route('/urls', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $longUrl = $data['longUrl'] ?? null;
        $userUuid = $data['userUuid'] ?? null;

        if (!$longUrl || !$userUuid) {
            return $this->json(['error' => 'Missing data'], 400);
        }

        // Find or Create User
        $user = $this->userRepository->findOneBy(['uuid' => $userUuid]);
        if (!$user) {
            $user = new User();
            $user->setUuid($userUuid);
            $this->entityManager->persist($user);
        }

        // Create Short URL
        $url = new Url();
        $url->setLongUrl($longUrl);
        $url->setShortCode($this->shortener->generateUniqueCode());
        $url->setOwner($user);
        $url->setIsPublic(true);
        $url->setClickCount(0);
        $url->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($url);
        $this->entityManager->flush();

        return $this->json([
            'shortCode' => $url->getShortCode(),
            'longUrl' => $url->getLongUrl(),
        ], 201);
    }

    // 2. RETRIEVE LINK FOR REDIRECT (GET) --- NEW METHOD
    #[Route('/urls/{code}', methods: ['GET'])]
    public function show(string $code, UrlRepository $urlRepository): JsonResponse
    {
        // Find the URL in the database
        $url = $urlRepository->findOneBy(['shortCode' => $code]);

        if (!$url) {
            return $this->json(['error' => 'Url not found'], 404);
        }

        // Optional: Increment click count here if you want
        // $url->setClickCount($url->getClickCount() + 1);
        // $this->entityManager->flush();

        return $this->json([
            'shortCode' => $url->getShortCode(),
            'longUrl' => $url->getLongUrl(),
        ]);
    }
}
