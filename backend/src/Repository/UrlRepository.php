<?php

namespace App\Repository;

use App\Entity\Url;
use App\Entity\Session;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Url>
 */
class UrlRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Url::class);
    }

    public function findByShortCode(string $shortCode): ?Url
    {
        return $this->findOneBy(['shortCode' => $shortCode]);
    }

    public function findBySessionAndVisibility(Session $session, ?string $visibility = null): array
    {
        $qb = $this->createQueryBuilder('u')
            ->where('u.session = :session')
            ->setParameter('session', $session)
            ->orderBy('u.createdAt', 'DESC');

        if ($visibility !== null) {
            $qb->andWhere('u.visibility = :visibility')
               ->setParameter('visibility', $visibility);
        }

        return $qb->getQuery()->getResult();
    }

    public function save(Url $url, bool $flush = false): void
    {
        $this->getEntityManager()->persist($url);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function flush(): void
    {
        $this->getEntityManager()->flush();
    }
}
