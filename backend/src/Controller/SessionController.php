<?php

namespace App\Controller;

use App\Entity\Session;
use App\Repository\SessionRepository;
use App\Service\JwtService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SessionController extends AbstractController
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private JwtService $jwtService
    ) {
    }

    #[Route('/api/session', name: 'api_session_create', methods: ['POST'])]
    public function createSession(): JsonResponse
    {
        $session = new Session();
        $this->sessionRepository->save($session, true);

        $token = $this->jwtService->createToken($session);

        return $this->json([
            'sessionToken' => $session->getSessionToken(),
            'jwtToken' => $token,
            'createdAt' => $session->getCreatedAt()->format('c')
        ], Response::HTTP_CREATED);
    }
}
