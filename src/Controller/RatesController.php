<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\DateService;
use App\Service\NbpClient;
use App\Service\RateCalculator;
use App\Service\SupportedCurrencies;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final class RatesController
{
    public function __construct(
        private SupportedCurrencies $supported,
        private NbpClient $nbp,
        private RateCalculator $calc,
        private DateService $dates
    ){}

    public function index(Request $request): JsonResponse
    {
        $date  = $this->dates->parseOrToday($request->query->get('date'));
        $table = $this->nbp->getTableAForDate($date);

        $rows = [];
        foreach ($this->supported->list() as $code) {
            if (!isset($table[$code])) continue;
            $mid = (float)$table[$code];
            $m   = $this->calc->applyRules($code, $mid);
            $rows[] = [
                'code' => $code,
                'name' => $this->supported->names()[$code] ?? $code,
                'mid'  => $mid,
                'buy'  => $m['buy'],
                'sell' => $m['sell'],
            ];
        }

        $resp = new JsonResponse([
            'date'   => $this->dates->format($date),
            'base'   => 'PLN',
            'rates'  => $rows,
            'source' => 'NBP table A',
        ], 200);
        $resp->headers->set('Cache-Control','public,max-age=300');
        return $resp;
    }

    public function history(Request $request, string $code): JsonResponse
    {
        $code = strtoupper($code);
        if (!$this->supported->isSupported($code)) {
            return new JsonResponse(['error'=>'Unsupported currency'], 400);
        }

        $end  = $this->dates->parseOrToday($request->query->get('date'));
        $daysRequested = (int)($request->query->get('days') ?? 14);

        // Pobierz szerokie okno kalendarzowe (np. 45 dni), żeby mieć >=14 sesji NBP
        $wideStart = $end->modify('-45 days');
        $rows = $this->nbp->getHistory($code, $wideStart, $end);

        // weź dokładnie 14 ostatnich notowań (sesje), nawet jeśli w kalendarzu są luki (weekend/święta)
        $rows = array_slice($rows, -$daysRequested);

        $out  = [];
        foreach ($rows as $r) {
            $mid = (float)$r['mid'];
            $m   = $this->calc->applyRules($code, $mid);
            $out[] = [
                'date' => $r['effectiveDate'],
                'mid'  => $mid,
                'buy'  => $m['buy'],
                'sell' => $m['sell'],
            ];
        }

        $resp = new JsonResponse([
            'code'    => $code,
            'history' => $out,
            'base'    => 'PLN',
            'source'  => 'NBP table A',
        ], 200);
        $resp->headers->set('Cache-Control','public,max-age=900');
        return $resp;
    }

}
