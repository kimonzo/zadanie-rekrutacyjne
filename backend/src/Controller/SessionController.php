<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/api')]
class SessionController extends AbstractController
{
    #[Route('/session', name: 'api_session_create', methods: ['POST'])]
    public function create(
        EntityManagerInterface $em,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $user = new User();

        $uuid = 'guest_' . bin2hex(random_bytes(8));
        $user->setUuid($uuid);

        $user->setRoles(['ROLE_USER']);

        $em->persist($user);
        $em->flush();

        // Generate the JWT
        $token = $jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'uuid' => $uuid
        ]);
    }
}
