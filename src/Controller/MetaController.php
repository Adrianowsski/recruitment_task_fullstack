<?php
declare(strict_types=1);

namespace App\Controller;

use App\Service\SupportedCurrencies;
use Symfony\Component\HttpFoundation\JsonResponse;

final class MetaController
{
    public function __construct(private SupportedCurrencies $supported) {}
    public function supported(): JsonResponse
    {
        return new JsonResponse(['supported' => $this->supported->list()]);
    }
}
