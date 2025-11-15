<?php

namespace App\Service;

use App\Entity\Session;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\User\InMemoryUser;

class JwtService
{
    public function __construct(
        private JWTTokenManagerInterface $jwtManager
    ) {
    }

    public function createToken(Session $session): string
    {
        // Create a user object with the session token as identifier
        $user = new InMemoryUser(
            $session->getSessionToken(),
            null,
            ['ROLE_USER']
        );

        return $this->jwtManager->create($user);
    }

    public function getSessionTokenFromPayload(array $payload): ?string
    {
        return $payload['username'] ?? null;
    }
}
