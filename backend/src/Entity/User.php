<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 36)]
    private ?string $uuid = null;

    #[ORM\OneToMany(mappedBy: 'owner', targetEntity: Url::class)]
    private Collection $urls;

    public function __construct()
    {
        $this->urls = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): ?string
    {
        return $this->uuid;
    }

    public function setUuid(string $uuid): static
    {
        $this->uuid = $uuid;

        return $this;
    }

    /**
     * @return Collection<int, Url>
     */
    public function getUrls(): Collection
    {
        return $this->urls;
    }

    public function addUrl(Url $url): static
    {
        if (!$this->urls->contains($url)) {
            $this->urls->add($url);
            $url->setOwner($this);
        }

        return $this;
    }

    public function removeUrl(Url $url): static
    {
        if ($this->urls->removeElement($url)) {
            if ($url->getOwner() === $this) {
            }
        }

        return $this;
    }
}
