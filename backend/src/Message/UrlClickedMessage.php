<?php

namespace App\Message;

class UrlClickedMessage
{
    public function __construct(
        private int $urlId
    ) {}

    public function getUrlId(): int
    {
        return $this->urlId;
    }
}
