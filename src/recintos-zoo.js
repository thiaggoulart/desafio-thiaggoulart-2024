class RecintosZoo {
    constructor() {
        this.recintos = [
            { numero: 1, bioma: 'savana', tamanhoTotal: 10, animaisExistentes: { macaco: 3, leao: 0, leopardo: 0, gazela: 0, crocodilo: 0, hipopotamo: 0 } },
            { numero: 2, bioma: 'floresta', tamanhoTotal: 5, animaisExistentes: { macaco: 0, leao: 0, leopardo: 0, gazela: 0, crocodilo: 0, hipopotamo: 0 } },
            { numero: 3, bioma: 'savana e rio', tamanhoTotal: 7, animaisExistentes: { macaco: 0, leao: 0, leopardo: 0, gazela: 1, crocodilo: 0, hipopotamo: 0 } },
            { numero: 4, bioma: 'rio', tamanhoTotal: 8, animaisExistentes: { macaco: 0, leao: 0, leopardo: 0, gazela: 0, crocodilo: 0, hipopotamo: 0 } },
            { numero: 5, bioma: 'savana', tamanhoTotal: 9, animaisExistentes: { macaco: 0, leao: 1, leopardo: 0, gazela: 0, crocodilo: 0, hipopotamo: 0 } }
        ];

        this.animais = {
            leao: { tamanho: 3, bioma: 'savana', carnivoro: true },
            leopardo: { tamanho: 2, bioma: 'savana', carnivoro: true },
            crocodilo: { tamanho: 3, bioma: 'rio', carnivoro: true },
            macaco: { tamanho: 1, bioma: 'savana ou floresta', carnivoro: false },
            gazela: { tamanho: 2, bioma: 'savana', carnivoro: false },
            hipopotamo: { tamanho: 4, bioma: 'savana ou rio', carnivoro: false }
        };
    }

    validaAnimal(animal) {
        const isValid = Object.keys(this.animais).includes(animal.toLowerCase());
        return isValid;
    }

    validaQuantidade(quantidade) {
        const isValid = Number.isInteger(quantidade) && quantidade > 0;
        return isValid;
    }

    calculaEspacoLivre(recinto, animal, quantidade) {
        const tamanhoAnimal = this.animais[animal].tamanho;
        const totalEspaco = recinto.tamanhoTotal;
        let espacoAtual = 0;

        for (const [key, valor] of Object.entries(recinto.animaisExistentes)) {
            if (this.animais[key]) {
                espacoAtual += valor * this.animais[key].tamanho;
            }
        }

        const espacoNecessario = quantidade * tamanhoAnimal;
        const possuiAnimaisExistentes = Object.values(recinto.animaisExistentes).some(val => val > 0);
        const jaTemEssaEspecie = recinto.animaisExistentes[animal] > 0;
        const espacoExtra = possuiAnimaisExistentes && !jaTemEssaEspecie ? tamanhoAnimal : 0;
        const espacoLivre = totalEspaco - espacoAtual - espacoNecessario - espacoExtra;

        return espacoLivre;
    }


    analisaRecintos(animal, quantidade) {
        const resultado = { recintosViaveis: [], erro: null };

        if (!this.validaAnimal(animal)) {
            resultado.erro = 'Animal inválido';
            resultado.recintosViaveis = null;
            return resultado;
        }

        if (!this.validaQuantidade(quantidade)) {
            resultado.erro = 'Quantidade inválida';
            resultado.recintosViaveis = null;
            return resultado;
        }

        const animalInfo = this.animais[animal.toLowerCase()];

        let recintosViaveis = this.recintos.filter(recinto => {
            const biomas = recinto.bioma.split(' e ');
            const espacoLivre = this.calculaEspacoLivre(recinto, animal.toLowerCase(), quantidade);
            const biomaNecessario = animalInfo.bioma.split(' ou ');
            const biomaCompativel = biomaNecessario.some(bioma => biomas.includes(bioma));
            let carnivorosNoRecinto = false;
            let possuiEspecieCompativel = true;

            if (animal.toLowerCase() === 'macaco') {
                possuiEspecieCompativel = (quantidade > 1 || Object.values(recinto.animaisExistentes).some(val => val > 0))
            }

            if (animal.toLowerCase() === 'hipopotamo') {
                possuiEspecieCompativel = biomas.includes('savana') && biomas.includes('rio');
            }

            if (animalInfo.carnivoro) {
                carnivorosNoRecinto = Object.keys(recinto.animaisExistentes).forEach(element => {
                    return this.animais[element].carnivoro && element !== animal.toLowerCase();
                });
                possuiEspecieCompativel = !carnivorosNoRecinto || Object.keys(recinto.animaisExistentes).length === 0;
            } else {
                Object.keys(recinto.animaisExistentes).forEach(element => {
                    if (this.animais[element].carnivoro && recinto.animaisExistentes[element] > 0) {
                        carnivorosNoRecinto = true;
                    }
                });
                possuiEspecieCompativel = !carnivorosNoRecinto;
            }

            const compatibilidade = espacoLivre >= 0 && biomaCompativel && possuiEspecieCompativel;

            return compatibilidade;
        });

        if (recintosViaveis.length === 0) {
            recintosViaveis = this.recintos.filter(recinto => {
                if (!recinto.bioma.includes(' e ')) return false;

                const biomas = recinto.bioma.split(' e ');
                const espacoLivre = this.calculaEspacoLivre(recinto, animal.toLowerCase(), quantidade);
                const biomaNecessario = animalInfo.bioma.split(' ou ');
                const biomaCompativel = biomaNecessario.some(bioma => biomas.includes(bioma));
                let possuiEspecieCompativel = true;

                if (animalInfo.carnivoro) {
                    const carnivorosNoRecinto = Object.keys(recinto.animaisExistentes).some(a => {
                        return this.animais[a].carnivoro && a !== animal.toLowerCase();
                    });
                    possuiEspecieCompativel = !carnivorosNoRecinto || Object.keys(recinto.animaisExistentes).length === 0;
                }

                if (animal === 'macaco') {
                    possuiEspecieCompativel = quantidade > 1 || Object.values(recinto.animaisExistentes).some(val => val > 0);
                }

                if (animal === 'hipopotamo') {
                    possuiEspecieCompativel = biomas.includes('savana') && biomas.includes('rio');
                }

                const compatibilidade = espacoLivre >= 0 && biomaCompativel && possuiEspecieCompativel;

                return compatibilidade;
            });
        }

        if (recintosViaveis.length > 0) {

            var disponiveis = recintosViaveis.map(r => `Recinto ${r.numero} (espaço livre: ${this.calculaEspacoLivre(r, animal.toLowerCase(), quantidade)} total: ${r.tamanhoTotal})`);
            resultado.recintosViaveis = disponiveis;
        } else {
            resultado.erro = 'Não há recinto viável';
            resultado.recintosViaveis = null;
        }
        return resultado;
    }
}

export { RecintosZoo as RecintosZoo };