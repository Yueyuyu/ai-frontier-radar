create table if not exists frontier_sources (
  id varchar(80) primary key,
  source_name varchar(160) not null,
  source_type varchar(64) not null,
  source_url text not null,
  access_method varchar(40) not null,
  auth_required tinyint(1) not null default 0,
  weight decimal(5,2) not null default 0,
  freshness_sla varchar(40) not null,
  status varchar(24) not null,
  required_env_json text not null,
  license_note varchar(500) not null default '',
  updated_at timestamp not null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists frontier_entities (
  id varchar(80) primary key,
  entity_name varchar(180) not null,
  aliases_json text not null,
  provider varchar(120) not null,
  category varchar(40) not null,
  homepage text not null,
  github_repo varchar(240) not null default '',
  hf_repo varchar(240) not null default '',
  product_url text not null,
  first_seen_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists frontier_raw_events (
  id varchar(80) primary key,
  source_id varchar(80) not null,
  entity_id varchar(80) null,
  event_title varchar(260) not null,
  event_url text not null,
  published_at timestamp null,
  fetched_at timestamp not null,
  raw_score decimal(10,2) null,
  raw_payload_hash varchar(64) not null,
  raw_payload_json mediumtext not null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists frontier_source_runs (
  id varchar(64) primary key,
  source_name varchar(120) not null,
  source_column varchar(80) not null,
  source_url text not null,
  access_method varchar(40) not null,
  status varchar(24) not null,
  item_count int not null default 0,
  checked_at timestamp not null,
  started_at timestamp null,
  finished_at timestamp null,
  latency_ms int null,
  next_run_at timestamp null,
  attempt_count int not null default 0,
  failed_attempts int not null default 0,
  retry_count int not null default 0,
  failure_rate decimal(5,2) not null default 0,
  message varchar(500) not null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists frontier_signals (
  id varchar(80) primary key,
  provider varchar(120) not null,
  signal_name varchar(160) not null,
  category varchar(40) not null,
  confidence int not null,
  level_name varchar(40) not null,
  summary text not null,
  release_window varchar(80) not null,
  first_seen varchar(80) not null,
  last_update varchar(80) not null,
  sources_json text not null,
  updated_at timestamp not null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists frontier_rankings (
  id varchar(64) primary key,
  rank_value int not null,
  item_name varchar(180) not null,
  provider varchar(120) not null,
  category varchar(40) not null,
  score int null,
  change_value int null,
  kind varchar(32) not null,
  source_name varchar(120) not null,
  item_url text not null,
  trend_json text not null,
  measured_at timestamp not null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists provider_raw_snapshots (
  id varchar(64) primary key,
  provider varchar(64) not null,
  sync_type varchar(40) not null,
  request_url text not null,
  response_sha256 varchar(64) not null,
  response_body mediumtext not null,
  captured_at timestamp not null,
  status varchar(32) not null,
  message varchar(500) not null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create index idx_frontier_source_runs_status_time
  on frontier_source_runs(status, checked_at);

create index idx_frontier_sources_type_status
  on frontier_sources(source_type, status);

create index idx_frontier_entities_category_provider
  on frontier_entities(category, provider);

create index idx_frontier_raw_events_source_time
  on frontier_raw_events(source_id, fetched_at);

create index idx_frontier_signals_category_score
  on frontier_signals(category, confidence);

create index idx_frontier_rankings_kind_rank
  on frontier_rankings(kind, rank_value);

create index idx_provider_raw_snapshots_provider_time
  on provider_raw_snapshots(provider, captured_at);
