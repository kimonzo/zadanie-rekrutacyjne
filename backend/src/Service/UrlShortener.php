<?php

namespace App\Service;

use App\Repository\UrlRepository;
use Symfony\Component\String\ByteString;

class UrlShortener
{
    // A confusing alphabet avoids characters that look alike (I, l, 1, O, 0)
    private const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    private const LENGTH = 6;

    public function __construct(
        private UrlRepository $urlRepository
    ) {}

    public function generateUniqueCode(): string
    {
        do {
            // Generate a random 6-character string from our safe alphabet
            $code = ByteString::fromRandom(self::LENGTH, self::ALPHABET)->toString();
        } while ($this->urlRepository->findOneBy(['shortCode' => $code]));
        // ^ If the code already exists in DB, loop and try again.

        return $code;
    }
}
