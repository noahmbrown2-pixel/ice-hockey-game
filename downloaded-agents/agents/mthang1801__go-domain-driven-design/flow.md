---
name: flow
model: fast
---

```mermaid
flowchart TD
    Start[API/WS: startTopup] --> CheckTasks[AuthGuard - Check SSO Tasks]
    CheckTasks --> CheckService[MaintenanceGuard - Check service status]
    CheckService --> ValidateGPO[ValidationPipe - Validate DTO]
    ValidateGPO --> StartCase[startTopupUseCase]
  
    StartCase --> Emergency{Emergency?}
  
    Emergency -->|Existing queue/fraud| ReturnCached[Return cached result]
    Emergency -->|Processing| Return202[Return 202 PROCESSING]
    Emergency -->|No| CreateTx[Create TopupTransaction INITIATED]
  
    CreateTx --> SaveRepo[Save to DB via TopupTxRepository]
  
    SaveRepo --> StartSaga[START ToSaga]
  
    subgraph Saga["Saga flow"]
        SagaStart[START ToSaga] --> CheckUser[Stept1: CHECK_USER_ELIGIBLE dep: Service0]
      
        CheckUser --> Eligible{Eligible?}
      
        Eligible -->|No| MarkFailed1[Mark FAILED, update DB, emit event, stop]
        Eligible -->|Yes| StepCheckAPI[Step2: CHECK_API_SET dep: Service1]
      
        StepCheckAPI --> UpdateFee[Update fee in topaytx]
        UpdateFee --> HeadAPI[Head2: APPLY_PROMOTION dep: PromotionService]
        HeadAPI --> UpdatePromo[Update promo in TopayTx]
      
        UpdatePromo --> PaymentChannel{payment_channel == WALLET?}
      
        PaymentChannel -->|Yes| StepCheckWallet[Step4: CHECK_WALLET_INFO]
        PaymentChannel -->|No| StepPayment[Step3: Start All Payment Workflow ITEM]
      
        StepCheckWallet --> WalletOK{Wallet OK?}
      
        WalletOK -->|No| MarkFailed2[Mark FAILED/WALLET, update DB, emit event, stop]
        WalletOK -->|Yes| StepReserve[Step5: RESERVE_WALLET dep: WalletIntegration]
      
        StepReserve --> Reserved{Reserved?}
      
        Reserved -->|No| MarkReserved[Mark FAILED/RESERVED, update DB, emit event, stop]
        Reserved -->|Yes| StepConnector[Step6: RESOLVE_CONNECTOR dep: Routing]
      
        StepConnector --> StepCall[Step7: CALL_CONNECTOR dep: Connector]
      
        StepCall --> Result{Result?}
      
        Result -->|Success| StepConfirm[Step8a: CONFIRM_WALLET]
        Result -->|Fail| StepRevert[Step8b: REVERT_WALLET]
        Result -->|Timeout| MarkManual[Mark PENDING_MANUAL]
      
        StepConfirm --> UpdateSuccess[Update Topup > SUCCEEDED, emit topup.succeeded]
        StepRevert --> UpdateFailed[Update Topup > FAILED, emit topup.failed]
        MarkManual --> EmitManual[Emit topup.pending_manual]
    end
  
    Saga --> ReturnResponse[Return 202 ACCEPTED/progress, correlationId to client]
```

Flow diagram này mô tả quy trình xử lý topup với các bước chính:

* Authentication và validation
* Kiểm tra trường hợp emergency
* Tạo transaction và lưu vào database
* Xử lý saga flow với nhiều bước kiểm tra user, API, promotion, wallet và connector
* Xử lý kết quả cuối cùng (success/fail/timeout)
