<?php

namespace App\Tests\Entity;

use App\Entity\Url;
use PHPUnit\Framework\TestCase;

class UrlTest extends TestCase
{
    public function testUrlEntityInitialization(): void
    {
        $url = new Url();

        $this->assertNotNull($url->getShortCode());
        $this->assertEquals(7, strlen($url->getShortCode()));
        $this->assertInstanceOf(\DateTimeImmutable::class, $url->getCreatedAt());
        $this->assertEquals(0, $url->getClickCount());
        $this->assertEquals('public', $url->getVisibility());
    }

    public function testIncrementClickCount(): void
    {
        $url = new Url();
        $this->assertEquals(0, $url->getClickCount());

        $url->incrementClickCount();
        $this->assertEquals(1, $url->getClickCount());

        $url->incrementClickCount();
        $this->assertEquals(2, $url->getClickCount());
    }

    public function testIsExpiredReturnsFalseWhenNoExpiration(): void
    {
        $url = new Url();
        $this->assertFalse($url->isExpired());
    }

    public function testIsExpiredReturnsTrueWhenExpired(): void
    {
        $url = new Url();
        $url->setExpiresAt(new \DateTimeImmutable('-1 hour'));

        $this->assertTrue($url->isExpired());
    }

    public function testIsExpiredReturnsFalseWhenNotExpired(): void
    {
        $url = new Url();
        $url->setExpiresAt(new \DateTimeImmutable('+1 hour'));

        $this->assertFalse($url->isExpired());
    }

    public function testSettersAndGetters(): void
    {
        $url = new Url();

        $url->setOriginalUrl('https://example.com');
        $this->assertEquals('https://example.com', $url->getOriginalUrl());

        $url->setVisibility('private');
        $this->assertEquals('private', $url->getVisibility());

        $url->setShortCode('abc123');
        $this->assertEquals('abc123', $url->getShortCode());

        $url->setClickCount(10);
        $this->assertEquals(10, $url->getClickCount());
    }
}
