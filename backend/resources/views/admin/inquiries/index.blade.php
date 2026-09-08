@extends('layouts.admin')

@section('title', 'Inquiries Management')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h1>Inquiries</h1>
    <div>
        <span class="badge bg-danger">{{ $inquiries->where('status', 'unread')->count() }} Unread</span>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <form method="GET" class="row g-3">
            <div class="col-md-4">
                <input type="text" name="search" class="form-control" placeholder="Search inquiries..." value="{{ request('search') }}">
            </div>
            <div class="col-md-3">
                <select name="status" class="form-select">
                    <option value="">All Status</option>
                    @foreach($statuses as $status)
                        <option value="{{ $status }}" {{ request('status') === $status ? 'selected' : '' }}>
                            {{ ucfirst($status) }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-1">
                <button type="submit" class="btn btn-secondary w-100">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </form>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sender</th>
                        <th>Email</th>
                        <th>Property</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($inquiries as $inquiry)
                        <tr class="{{ $inquiry->status === 'unread' ? 'table-warning' : '' }}">
                            <td>#{{ $inquiry->id }}</td>
                            <td>
                                <strong>{{ $inquiry->sender_name }}</strong>
                                @if($inquiry->seeker)
                                    <br><small class="text-muted">Registered User</small>
                                @endif
                            </td>
                            <td>{{ $inquiry->sender_email }}</td>
                            <td>
                                @if($inquiry->property)
                                    <a href="{{ route('admin.properties.show', $inquiry->property->id) }}">
                                        {{ Str::limit($inquiry->property->title, 30) }}
                                    </a>
                                @else
                                    <span class="text-muted">Property deleted</span>
                                @endif
                            </td>
                            <td>{{ Str::limit($inquiry->message, 50) }}</td>
                            <td>
                                <span class="badge bg-{{ $inquiry->status === 'unread' ? 'danger' : ($inquiry->status === 'read' ? 'warning' : 'success') }}">
                                    {{ ucfirst($inquiry->status) }}
                                </span>
                            </td>
                            <td>{{ $inquiry->created_at->format('M d, Y') }}</td>
                            <td class="action-btns">
                                <a href="{{ route('admin.inquiries.show', $inquiry->id) }}" class="btn btn-sm btn-info" title="View">
                                    <i class="bi bi-eye"></i>
                                </a>
                                <form action="{{ route('admin.inquiries.destroy', $inquiry->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Are you sure?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-danger" title="Delete">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">No inquiries found</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $inquiries->links() }}
    </div>
</div>
@endsection