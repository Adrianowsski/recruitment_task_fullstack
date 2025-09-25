<?php
declare(strict_types=1);

namespace App\Service;

use DateTimeImmutable;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

final class NbpClient
{
    public function __construct(private CacheInterface $cache) {}

    /** @return array<string,float> code => mid; fallback do 7 dni wstecz */
    public function getTableAForDate(DateTimeImmutable $date): array
    {
        $key = 'nbp_tableA_'.$date->format('Y-m-d');
        return $this->cache->get($key, function (ItemInterface $it) use ($date) {
            $it->expiresAfter(600);

            $d = $date;
            for ($i = 0; $i < 7; $i++) {
                $url = sprintf('https://api.nbp.pl/api/exchangerates/tables/A/%s?format=json', $d->format('Y-m-d'));
                $data = $this->fetchJson($url);
                if (is_array($data) && !empty($data[0]['rates'])) {
                    $map = [];
                    foreach ($data[0]['rates'] as $row) {
                        $map[strtoupper($row['code'])] = (float)$row['mid'];
                    }
                    return $map;
                }
                $d = $d->modify('-1 day');
            }
            return [];
        });
    }

    /** @return array<int,array{effectiveDate:string,mid:float}> */
    public function getHistory(string $code, DateTimeImmutable $start, DateTimeImmutable $end): array
    {
        $code = strtoupper($code);
        $key  = sprintf('nbp_hist_%s_%s_%s', $code, $start->format('Y-m-d'), $end->format('Y-m-d'));

        return $this->cache->get($key, function (ItemInterface $it) use ($code, $start, $end) {
            $it->expiresAfter(3600);
            $url = sprintf(
                'https://api.nbp.pl/api/exchangerates/rates/A/%s/%s/%s?format=json',
                $code, $start->format('Y-m-d'), $end->format('Y-m-d')
            );
            $data = $this->fetchJson($url);
            return is_array($data['rates'] ?? null) ? $data['rates'] : [];
        });
    }

    private function fetchJson(string $url): ?array
    {
        $ctx = stream_context_create([
            'http' => [
                'method'  => 'GET',
                'timeout' => 6,
                'header'  => "Accept: application/json\r\nUser-Agent: KantorApp/1.0\r\n",
            ]
        ]);
        $raw = @file_get_contents($url, false, $ctx);
        if ($raw === false) return null;
        $data = json_decode($raw, true);
        return is_array($data) ? $data : null;
    }
}
