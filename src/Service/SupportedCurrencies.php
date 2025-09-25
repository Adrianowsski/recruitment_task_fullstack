<?php
declare(strict_types=1);

namespace App\Service;

final class SupportedCurrencies
{
    public function list(): array { return ['EUR','USD','CZK','IDR','BRL']; }
    public function names(): array {
        return [
            'EUR'=>'euro',
            'USD'=>'dolar amerykański',
            'CZK'=>'korona czeska',
            'IDR'=>'rupia indonezyjska',
            'BRL'=>'real brazylijski',
        ];
    }
    public function isSupported(string $code): bool
    { return in_array(strtoupper($code), $this->list(), true); }
}
