<?php

namespace App\MessageHandler;

use App\Entity\Url;
use App\Message\UrlClickedMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class UrlClickedMessageHandler
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function __invoke(UrlClickedMessage $message): void
    {
        // 1. Find the URL
        $url = $this->entityManager->getRepository(Url::class)->find($message->getUrlId());

        if (!$url) {
            return;
        }

        // 2. Increment click count
        $url->setClickCount($url->getClickCount() + 1);

        // 3. Save to DB
        $this->entityManager->persist($url);
        $this->entityManager->flush();

        echo " [x] Updated clicks for URL ID: " . $message->getUrlId() . "\n";
    }
}
