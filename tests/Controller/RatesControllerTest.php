<?php
declare(strict_types=1);

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class RatesControllerTest extends WebTestCase
{
    public function testRatesEndpointReturnsCalculatedValues(): void
    {
        $c = static::createClient();
        $c->request('GET', '/api/rates?date=2025-09-25');

        $this->assertResponseIsSuccessful();
        $data = json_decode($c->getResponse()->getContent(), true);

        $this->assertSame('PLN', $data['base']);
        $this->assertSame('2025-09-25', $data['date']);

        $eur = array_values(array_filter($data['rates'], fn($r) => $r['code'] === 'EUR'))[0];
        $this->assertSame(4.2619, $eur['mid']);
        $this->assertSame(4.1119, $eur['buy']);   // 4.2619 - 0.15
        $this->assertSame(4.3719, $eur['sell']);  // 4.2619 + 0.11
    }
}
