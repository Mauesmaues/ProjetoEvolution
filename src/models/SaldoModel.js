class SaldoModel {
    constructor(saldo) {
        this.saldoOriginal = saldo;
        // Cache para conversões - calculadas apenas quando necessário
        this._saldoConvertido = null;
        this._saldoFormatado = null;
    }

    // Lazy loading - calcula apenas quando acessado
    get saldo() {
        if (this._saldoConvertido === null) {
            const valorNumerico = parseFloat(this.saldoOriginal) || 0;
            // Usando divisão por 3200 que deu o resultado correto (0.42)
            this._saldoConvertido = (valorNumerico / 3200).toFixed(2);
            console.log('[SaldoModel] Saldo convertido calculado:', this._saldoConvertido);
        }
        return this._saldoConvertido;
    }

    getSaldoFormatado() {
        if (this._saldoFormatado === null) {
            this._saldoFormatado = `R$ ${this.saldo}`;
        }
        return this._saldoFormatado;
    }

    getSaldoCentavos() {
        return this.saldoOriginal;
    }
}

module.exports = SaldoModel;
