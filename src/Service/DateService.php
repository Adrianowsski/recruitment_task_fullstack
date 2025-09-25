<?php
declare(strict_types=1);

namespace App\Service;

use DateInterval;
use DateTimeImmutable;

final class DateService
{
    public function parseOrToday(?string $date): DateTimeImmutable
    {
        if ($date) {
            $dt = DateTimeImmutable::createFromFormat('Y-m-d', $date);
            if ($dt) return $dt;
        }
        return new DateTimeImmutable('today');
    }

    /** @return array{start: DateTimeImmutable, end: DateTimeImmutable} */
    public function windowBackwards(DateTimeImmutable $end, int $days): array
    {
        $start = $end->sub(new DateInterval('P'.max(1,$days-1).'D'));
        return ['start'=>$start,'end'=>$end];
    }

    public function format(DateTimeImmutable $d): string { return $d->format('Y-m-d'); }
}
