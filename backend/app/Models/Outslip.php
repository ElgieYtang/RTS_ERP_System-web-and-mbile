<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Outslip extends Model
{
    protected $table = 'outslip_main';

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'customer_name',
        'outslip_no',
        'outslip_date',
        'receiving_id',
        'branch_id',
        'prepared_by',
        'status',
        'date_created',
    ];

    protected function casts(): array
    {
        return [
            'outslip_date' => 'date',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(OutslipDetail::class, 'outslip_id');
    }
}
