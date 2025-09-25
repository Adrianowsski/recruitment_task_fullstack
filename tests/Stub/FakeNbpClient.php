<?php
declare(strict_types=1);

namespace App\Tests\Stub;

use App\Service\NbpClient;
use DateTimeImmutable;

final class FakeNbpClient extends NbpClient
{
    public function __construct() {}

    public function getTableAForDate(DateTimeImmutable $date): array
    {
        return [
            'EUR' => 4.2619,
            'USD' => 3.6295,
            'CZK' => 0.1755,
            'IDR' => 0.0002,
            'BRL' => 0.6810,
        ];
    }

    public function getHistory(string $code, DateTimeImmutable $start, DateTimeImmutable $end): array
    {
        return [
            ['effectiveDate' => '2025-09-08', 'mid' => 4.2484],
            ['effectiveDate' => '2025-09-15', 'mid' => 4.2476],
            ['effectiveDate' => '2025-09-25', 'mid' => 4.2619],
        ];
    }
}
