<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('property.{propertyId}', function ($user, $propertyId) {
    return true;
});

Broadcast::channel('agent.{agentId}', function ($user, $agentId) {
    return (int) $user->id === (int) $agentId;
});