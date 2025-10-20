class SaldoGadsModel {
    constructor(customerId, customerName, currency, balance, accountType) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.currency = currency;
        this.balance = balance;
        this.accountType = accountType; // 'prepaid' ou 'credit_card'
    }

    // Formatar saldo para exibição
    getFormattedBalance() {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: this.currency || 'BRL'
        }).format(this.balance);
    }

    // Verificar se é conta pré-paga
    isPrepaid() {
        return this.accountType === 'prepaid';
    }

    // Verificar se é cartão de crédito
    isCreditCard() {
        return this.accountType === 'credit_card';
    }

    // Converter de micros para valor real
    static convertFromMicros(micros) {
        return micros ? micros / 1000000 : 0;
    }
}

module.exports = SaldoGadsModel;