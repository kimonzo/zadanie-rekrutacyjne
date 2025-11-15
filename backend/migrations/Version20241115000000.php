<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241115000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create sessions and urls tables';
    }

    public function up(Schema $schema): void
    {
        // Create sessions table
        $this->addSql('CREATE SEQUENCE sessions_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE sessions (
            id INT NOT NULL,
            session_token VARCHAR(255) NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9A609D13CF5EBA3E ON sessions (session_token)');
        $this->addSql('COMMENT ON COLUMN sessions.created_at IS \'(DC2Type:datetime_immutable)\'');

        // Create urls table
        $this->addSql('CREATE SEQUENCE urls_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE urls (
            id INT NOT NULL,
            session_id INT NOT NULL,
            original_url VARCHAR(2048) NOT NULL,
            short_code VARCHAR(10) NOT NULL,
            visibility VARCHAR(20) NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            click_count INT NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2A9437A179F37AE5 ON urls (short_code)');
        $this->addSql('CREATE INDEX idx_short_code ON urls (short_code)');
        $this->addSql('CREATE INDEX IDX_2A9437A1613FECDF ON urls (session_id)');
        $this->addSql('COMMENT ON COLUMN urls.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN urls.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE urls ADD CONSTRAINT FK_2A9437A1613FECDF FOREIGN KEY (session_id) REFERENCES sessions (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE urls');
        $this->addSql('DROP SEQUENCE urls_id_seq CASCADE');
        $this->addSql('DROP TABLE sessions');
        $this->addSql('DROP SEQUENCE sessions_id_seq CASCADE');
    }
}
