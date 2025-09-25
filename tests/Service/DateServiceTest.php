<?php
declare(strict_types=1);

namespace App\Tests\Service;

use App\Service\DateService;
use PHPUnit\Framework\TestCase;

final class DateServiceTest extends TestCase
{
    public function testWindowBackwards(): void
    {
        $svc = new DateService();
        $end = $svc->parseOrToday('2025-09-25');
        $win = $svc->windowBackwards($end, 14);

        $this->assertSame('2025-09-12', $svc->format($win['start']));
        $this->assertSame('2025-09-25', $svc->format($win['end']));
    }
}
