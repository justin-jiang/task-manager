import { ReceiptState } from './ReceiptState';
export class FeeCalculator {
    private static readonly agentFeeRate: number = 0.1;
    private static readonly receiptRate: number = 0.1;
    public static calcPaymentToExecutor(reward: number, margin: number, receiptRate: ReceiptState) {
        let fee: number = reward + margin - reward * this.agentFeeRate;
        if (receiptRate === ReceiptState.NotRequired) {
            fee = fee - (reward * this.receiptRate);
        }
        return Math.round(fee);
    }

    public static calcPublisherDeposit(taskReward: number, receiptRate: ReceiptState) {
        let fee: number = taskReward;
        if (receiptRate === ReceiptState.Required) {
            fee = fee + (taskReward * this.receiptRate);
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
