<?php
declare(strict_types=1);

namespace App\Tests\Service;

use App\Service\RateCalculator;
use PHPUnit\Framework\TestCase;

final class RateCalculatorTest extends TestCase
{
    public function testRules(): void
    {
        $c = new RateCalculator();

        $eur = $c->applyRules('EUR', 4.20);
        $this->assertSame(4.05, $eur['buy']);   // 4.20 - 0.15
        $this->assertSame(4.31, $eur['sell']);  // 4.20 + 0.11

        $czk = $c->applyRules('CZK', 0.17);
        $this->assertNull($czk['buy']);
        $this->assertSame(0.37, $czk['sell']);  // 0.17 + 0.20
    }
}
