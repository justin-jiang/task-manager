import { TaskView } from 'common/responseResults/TaskView';
import { CommonUtils } from 'common/CommonUtils';
import { ReceiptState } from './ReceiptState';
export class FeeCalculator {
    private static readonly agentFeeRate: number = 0.1;
    private static readonly receiptRate: number = 0.1;
    public static calcPaymentToExecutor(task: TaskView) {
        let fee: number = (task.reward as number) -
            (task.proposedMargin as number) -
            ((task.reward as number) * this.agentFeeRate);
        if (CommonUtils.isNullOrEmpty(task.executorReceiptNumber)) {
            fee = fee - ((task.reward as number) * this.receiptRate);
        }
        return Math.round(fee);
    }
    
    public static calcPublisherDeposit(task: TaskView) {
        let fee: number = task.reward as number;
        if (task.publisherReceiptRequired === ReceiptState.Required) {
            fee = fee + ((task.reward as number) * this.receiptRate);
        }
        return Math.round(fee);
    }

    public static calcReceiptTax(value: number): number {
        return Math.round(value * this.receiptRate);
    }

    public static calcAgentFee(value: number): number {
        return Math.round(value * this.agentFeeRate);
    }
}
