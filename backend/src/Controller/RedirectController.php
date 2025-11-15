<?php

namespace App\Controller;

use App\Repository\UrlRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class RedirectController extends AbstractController
{
    public function __construct(
        private UrlRepository $urlRepository
    ) {
    }

    #[Route('/{shortCode}', name: 'redirect_short_url', methods: ['GET'], priority: -1)]
    public function redirect(string $shortCode): Response
    {
        $url = $this->urlRepository->findByShortCode($shortCode);

        if (!$url) {
            return $this->json(['error' => 'Short URL not found'], Response::HTTP_NOT_FOUND);
        }

        if ($url->isExpired()) {
            return $this->json(['error' => 'Short URL has expired'], Response::HTTP_GONE);
        }

        // Increment click count
        $url->incrementClickCount();
        $this->urlRepository->flush();

        // Redirect to original URL
        return $this->redirect($url->getOriginalUrl(), Response::HTTP_FOUND);
    }
}
