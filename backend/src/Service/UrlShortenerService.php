<?php

namespace App\Service;

use App\Entity\Url;
use App\Entity\Session;
use App\Repository\UrlRepository;

class UrlShortenerService
{
    public function __construct(
        private UrlRepository $urlRepository
    ) {
    }

    public function createShortUrl(
        string $originalUrl,
        Session $session,
        string $visibility = 'public',
        ?string $expiresIn = null
    ): Url {
        $url = new Url();
        $url->setOriginalUrl($originalUrl);
        $url->setSession($session);
        $url->setVisibility($visibility);

        if ($expiresIn !== null) {
            $expiresAt = $this->calculateExpirationTime($expiresIn);
            $url->setExpiresAt($expiresAt);
        }

        // Ensure unique short code
        $attempts = 0;
        while ($attempts < 10) {
            $existingUrl = $this->urlRepository->findByShortCode($url->getShortCode());
            if ($existingUrl === null) {
                break;
            }
            $url->setShortCode($this->generateShortCode());
            $attempts++;
        }

        $this->urlRepository->save($url, true);

        return $url;
    }

    private function calculateExpirationTime(string $expiresIn): \DateTimeImmutable
    {
        $now = new \DateTimeImmutable();

        return match ($expiresIn) {
            '1h' => $now->modify('+1 hour'),
            '1d' => $now->modify('+1 day'),
            '1w' => $now->modify('+1 week'),
            '1t' => $now->modify('+1 week'), // 1t = 1 tydzień (week)
            default => $now->modify('+1 day'),
        };
    }

    private function generateShortCode(): string
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $shortCode = '';
        for ($i = 0; $i < 7; $i++) {
            $shortCode .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $shortCode;
    }
}
