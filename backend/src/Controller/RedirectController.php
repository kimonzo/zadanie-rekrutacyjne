<?php

namespace App\Controller;

use App\Entity\Url;
use App\Message\UrlClickedMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

class RedirectController extends AbstractController
{
    /**
     * Matches any root path (e.g., /abc, /xYz) EXCEPT /api or system paths.
     */
    #[Route('/{code}', name: 'app_redirect', requirements: ['code' => '^(?!api|_|favicon).+'], methods: ['GET'])]
    public function redirectUrl(string $code, EntityManagerInterface $em, MessageBusInterface $bus): Response
    {
        // 1. Find the URL
        $url = $em->getRepository(Url::class)->findOneBy(['shortCode' => $code]);

        // 2. Validate (Exists? Not deleted? Not expired?)
        if (!$url || $url->getDeletedAt()) {
            throw $this->createNotFoundException('MiniLink not found.');
        }

        if ($url->getExpiresAt() && $url->getExpiresAt() < new \DateTimeImmutable()) {
            throw $this->createNotFoundException('This MiniLink has expired.');
        }

        // 3. Dispatch the Async Message to RabbitMQ
        $bus->dispatch(new UrlClickedMessage($url->getId()));

        // 4. Perform the actual 302 Redirect to the long URL
        return $this->redirect($url->getLongUrl());
    }
}
