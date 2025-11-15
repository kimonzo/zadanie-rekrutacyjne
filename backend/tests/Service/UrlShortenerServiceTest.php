<?php

namespace App\Tests\Service;

use App\Entity\Session;
use App\Entity\Url;
use App\Repository\UrlRepository;
use App\Service\UrlShortenerService;
use PHPUnit\Framework\TestCase;

class UrlShortenerServiceTest extends TestCase
{
    public function testCreateShortUrlGeneratesUniqueShortCode(): void
    {
        $urlRepository = $this->createMock(UrlRepository::class);
        $urlRepository->expects($this->once())
            ->method('findByShortCode')
            ->willReturn(null);
        $urlRepository->expects($this->once())
            ->method('save');

        $service = new UrlShortenerService($urlRepository);
        $session = new Session();

        $url = $service->createShortUrl(
            'https://example.com/very/long/url',
            $session,
            'public'
        );

        $this->assertInstanceOf(Url::class, $url);
        $this->assertEquals('https://example.com/very/long/url', $url->getOriginalUrl());
        $this->assertEquals('public', $url->getVisibility());
        $this->assertNotNull($url->getShortCode());
        $this->assertEquals(7, strlen($url->getShortCode()));
    }

    public function testCreateShortUrlWithExpiration(): void
    {
        $urlRepository = $this->createMock(UrlRepository::class);
        $urlRepository->method('findByShortCode')->willReturn(null);
        $urlRepository->method('save');

        $service = new UrlShortenerService($urlRepository);
        $session = new Session();

        $url = $service->createShortUrl(
            'https://example.com/test',
            $session,
            'private',
            '1h'
        );

        $this->assertInstanceOf(Url::class, $url);
        $this->assertNotNull($url->getExpiresAt());
        $this->assertGreaterThan(new \DateTimeImmutable(), $url->getExpiresAt());
    }

    public function testCreateShortUrlSetsCorrectVisibility(): void
    {
        $urlRepository = $this->createMock(UrlRepository::class);
        $urlRepository->method('findByShortCode')->willReturn(null);
        $urlRepository->method('save');

        $service = new UrlShortenerService($urlRepository);
        $session = new Session();

        $publicUrl = $service->createShortUrl(
            'https://example.com/public',
            $session,
            'public'
        );

        $privateUrl = $service->createShortUrl(
            'https://example.com/private',
            $session,
            'private'
        );

        $this->assertEquals('public', $publicUrl->getVisibility());
        $this->assertEquals('private', $privateUrl->getVisibility());
    }
}
