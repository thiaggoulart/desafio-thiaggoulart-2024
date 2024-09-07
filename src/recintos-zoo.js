class Animal {
    constructor(nome, recintos, animais) {
        this.nome = nome.toLowerCase();
        this.recintos = recintos;
        this.animais = animais;
        this.info = this.animais[this.nome];
    }

    validaAnimal() {
        return Object.keys(this.animais).includes(this.nome);
    }

    validaQuantidade(quantidade) {
        return Number.isInteger(quantidade) && quantidade > 0;
    }

    encontrarRecintos(quantidade) {
        if (!this.validaAnimal()) {
            return { erro: 'Animal inválido', recintosViaveis: null };
        }
        if (!this.validaQuantidade(quantidade)) {
            return { erro: 'Quantidade inválida', recintosViaveis: null };
        }

        const recintosViaveis = this.recintos.filter(recinto =>
            this.ehViavelParaRecinto(recinto, quantidade)
        );
        return { erro: null, recintosViaveis };
    }

    ehViavelParaRecinto(recinto, quantidade) {
        const biomas = recinto.bioma.split(' e ');
        const espacoLivre = this.calculaEspacoLivre(recinto, quantidade);
        const biomaNecessario = this.info.bioma.split(' ou ');
        const biomaCompativel = biomaNecessario.some(bioma => biomas.includes(bioma));
        const possuiEspecieCompativel = this.ehEspecieCompativel(recinto, quantidade);

        return espacoLivre >= 0 && biomaCompativel && possuiEspecieCompativel;
    }

    calculaEspacoLivre(recinto, quantidade) {
        const tamanhoAnimal = this.info.tamanho;
        const totalEspaco = recinto.tamanhoTotal;
        let espacoAtual = 0;

        for (const [key, valor] of Object.entries(recinto.animaisExistentes)) {
            if (this.animais[key]) {
                espacoAtual += valor * this.animais[key].tamanho;
            }
        }

        const espacoNecessario = quantidade * tamanhoAnimal;
        const espacoExtra = this.deveConsiderarEspacoExtra(recinto) ? 1 : 0;
        return totalEspaco - espacoAtual - espacoNecessario - espacoExtra;
    }

    deveConsiderarEspacoExtra(recinto) {
        const possuiAnimaisExistentes = Object.values(recinto.animaisExistentes).some(val => val > 0);
        return possuiAnimaisExistentes && !recinto.animaisExistentes[this.nome];
    }

    ehEspecieCompativel(recinto) {
        if (this.info.carnivoro) {
            return !Object.keys(recinto.animaisExistentes).some(animal => {
                return animal !== this.nome && recinto.animaisExistentes[animal] > 0;
            });
        } else {
            return !Object.keys(recinto.animaisExistentes).some(animal => {
                return this.animais[animal].carnivoro && recinto.animaisExistentes[animal] > 0;
            });
        }
    }
}

class Macaco extends Animal {
    ehEspecieCompativel(recinto, quantidade) {
        return super.ehEspecieCompativel(recinto) && (quantidade > 1 || Object.values(recinto.animaisExistentes).some(val => val > 0));
    }
}

class Hipopotamo extends Animal {
    ehEspecieCompativel(recinto) {
        return super.ehEspecieCompativel(recinto) && recinto.bioma.includes('savana') && recinto.bioma.includes('rio');
    }
}

class Recinto {
    constructor(dados) {
        this.numero = dados.numero;
        this.bioma = dados.bioma;
        this.tamanhoTotal = dados.tamanhoTotal;
        this.animaisExistentes = dados.animaisExistentes;
    }
}

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

    criarAnimal(nome) {
        switch (nome) {
            case 'macaco':
                return new Macaco(nome, this.recintos, this.animais);
            case 'hipopotamo':
                return new Hipopotamo(nome, this.recintos, this.animais);
            default:
                return new Animal(nome, this.recintos, this.animais);
        }
    }

    analisaRecintos(animalNome, quantidade) {
        let nome = animalNome.toLowerCase();
        const animal = this.criarAnimal(nome);
        const { erro, recintosViaveis } = animal.encontrarRecintos(quantidade);

        if (erro) {
            return { recintosViaveis: null, erro };
        }

        if (recintosViaveis.length === 0) {
            return { recintosViaveis: null, erro: 'Não há recinto viável' };
        }

        const resultado = recintosViaveis.map(r => `Recinto ${r.numero} (espaço livre: ${animal.calculaEspacoLivre(new Recinto(r), quantidade)} total: ${r.tamanhoTotal})`);
        return { recintosViaveis: resultado, erro: null };
    }
}

export { RecintosZoo as RecintosZoo };