<?php

namespace App\Tests\Entity;

use App\Entity\Url;
use PHPUnit\Framework\TestCase;

class UrlTest extends TestCase
{
    // Test 1: Verify the URL is NOT expired if the date is in the future
    public function testUrlIsNotExpiredIfDateIsInFuture(): void
    {
        $url = new Url();
        $futureDate = new \DateTimeImmutable('+1 hour');
        $url->setExpiresAt($futureDate);

        $this->assertEquals($futureDate, $url->getExpiresAt());
        $this->assertGreaterThan(new \DateTimeImmutable(), $url->getExpiresAt());
    }

    // Test 2: Verify Click Count starts at 0
    public function testClickCountDefaultsToZero(): void
    {
        $url = new Url();
        // The property should be initialized to 0 in the entity or constructor
        $this->assertSame(0, $url->getClickCount());
    }
}
