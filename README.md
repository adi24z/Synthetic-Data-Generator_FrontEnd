# AI Synthetic Data Generator – Frontend

## Overview

The frontend is a **React-based real-time control dashboard** that interacts with the backend pipeline to:

- Trigger synthetic dataset generation
- Track Airflow DAG execution in real time
- Display task-level progress
- Provide job status visibility

It acts as a **live orchestration UI layer** over a distributed backend system.

## Architecture - High Level Design
```
                ┌──────────────────────────┐
                │       User Browser       │
                │   (React Application)    │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │        React UI          │
                │  State + Components      │
                └────────────┬─────────────┘
                             │ REST API Calls
                             ▼
                ┌──────────────────────────┐
                │        FastAPI           │
                │     Backend Gateway      │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │     Airflow Pipeline     │
                │   (Async Execution)      │
                └──────────────────────────┘
```
# Component Breakdown
### API Layer
* fetch() calls FastAPI endpoints
* Handles JSON request/response

### State Management
React Hooks:
* useState → form data
* useEffect → polling system
* setInterval → real-time updates
---
# Process Flow
## 1) Entering Input
Keyword
Rows
Recipient Email

```
{
  "keyword": "Aircrafts",
  "rows": 1000,
  "email": "user@gmail.com"
}
```
## 2) Trigger Pipeline
Front-End sends request:
```
POST http://localhost:8000/generate-data
```
**Payload Sent**

## 3) DAG Initialisation
The endpoint receives a GET from backend
```
{
  "dag_run_id": "manual__12345",
  "state": "running"
}
```
its stored by FrontEnd

## 4) Real Time Polling
Polling starts after every 3 seconds
```
GET /task-status/{dag_run_id}
```
## 5) Task Monitoring
```
{
  "task_instances": [
    { "task_id": "generate_schema", "state": "success" },
    { "task_id": "generate_data", "state": "running" },
    { "task_id": "send_email", "state": "queued" }
  ]
}
```
## 6) Progress Calculation
```
progress =
  (successTasks / totalTasks) * 100;
```
**Example**
2/3 complete = 66%

## 7) UI States:
```
| State      | Meaning                  |
| ---------- | ------------------------ |
| SUBMITTING | Request sent             |
| RUNNING    | DAG executing            |
| SUCCESS    | Pipeline completed       |
| FAILED     | One or more tasks failed |

```
### Concurrency Aspect:
```
| Feature    | Type               |
| ---------- | ------------------ |
| API Calls  | Async              |
| Polling    | Interval-based     |
| UI Updates | Reactive rendering |
```
---
# Run Locally
1) Git clone "Repo URL"
2) npm install
3) npm start
4) Backend should be running
