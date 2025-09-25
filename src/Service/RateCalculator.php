<?php
declare(strict_types=1);

namespace App\Service;

final class RateCalculator
{
    /** @return array{buy:?float,sell:float} */
    public function applyRules(string $code, float $mid): array
    {
        $code = strtoupper($code);
        if (in_array($code, ['EUR','USD'], true)) {
            return ['buy'=>round($mid-0.15,4), 'sell'=>round($mid+0.11,4)];
        }
        return ['buy'=>null, 'sell'=>round($mid+0.20,4)];
    }
}
