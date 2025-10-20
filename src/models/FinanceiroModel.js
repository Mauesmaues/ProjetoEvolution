class FinanceiroModel {
    constructor() {
        this.saldo = 0;
    }

    atualizarSaldo(valor) {
        this.saldo += valor;
    }

    obterSaldo() {
        return this.saldo;
    }
}
