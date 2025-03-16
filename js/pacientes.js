// Gerenciamento de Pacientes
class Pacientes {
    constructor() {
        this.initialize();
        this.pacienteEditandoIndex = null; // Adicionar controle do índice do paciente sendo editado
    }

    initialize() {
        // Aguardar o DOM estar completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        // Elementos do DOM
        this.tabelaPacientes = document.getElementById('pacientes-dados');
        this.semPacientes = document.getElementById('sem-pacientes');
        this.formPaciente = document.getElementById('form-paciente');
        this.cepInput = document.getElementById('cep');
        this.dataNascimentoInput = document.getElementById('data_nascimento');
        this.idadeInput = document.getElementById('idade');
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');

        if (this.formPaciente) {
            this.setupFormListeners();
        }

        if (this.cepInput) {
            this.setupCEPListener();
        }

        if (this.dataNascimentoInput) {
            this.setupDataNascimentoListener();
        }

        this.setupTabListeners();
        this.carregarPacientes();
    }

    setupFormListeners() {
        this.formPaciente.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarPaciente();
        });

        // Adicionar listener para o botão Cancelar
        const btnCancelar = document.getElementById('cancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                this.formPaciente.reset();
                this.pacienteEditandoIndex = null;
                document.getElementById('formulario-cadastro').classList.add('hidden');
                document.getElementById('lista-pacientes').classList.remove('hidden');
            });
        }

        // Adicionar listeners para os botões de convênio
        const convenioSim = document.getElementById('convenio_sim');
        const convenioNao = document.getElementById('convenio_nao');
        const camposConvenio = document.getElementById('campos-convenio');

        if (convenioSim && convenioNao && camposConvenio) {
            convenioSim.addEventListener('change', () => {
                camposConvenio.classList.remove('hidden');
            });

            convenioNao.addEventListener('change', () => {
                camposConvenio.classList.add('hidden');
                // Limpar campos do convênio
                document.getElementById('nome_convenio').value = '';
                document.getElementById('operadora_convenio').value = '';
            });
        }

        // Adicionar listeners para os botões de período
        const periodoDeterminado = document.getElementById('periodo_determinado');
        const periodoIndeterminado = document.getElementById('periodo_indeterminado');
        const quantidadeDias = document.getElementById('quantidade_dias');

        if (periodoDeterminado && periodoIndeterminado && quantidadeDias) {
            periodoDeterminado.addEventListener('change', () => {
                quantidadeDias.disabled = false;
                quantidadeDias.required = true;
            });

            periodoIndeterminado.addEventListener('change', () => {
                quantidadeDias.disabled = true;
                quantidadeDias.required = false;
                quantidadeDias.value = '';
            });
        }
    }

    setupCEPListener() {
        this.cepInput.addEventListener('blur', () => {
            const cep = this.cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) {
                this.buscarCEP(cep);
            }
        });
    }

    setupDataNascimentoListener() {
        this.dataNascimentoInput.addEventListener('change', () => {
            this.calcularIdade();
        });
    }

    setupTabListeners() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                this.trocarAba(tab);
            });
        });
    }

    trocarAba(tab) {
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tab) {
                button.classList.add('active');
            }
        });

        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tab) {
                content.classList.add('active');
            }
        });
    }

    async buscarCEP(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('logradouro').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('uf').value = data.uf;
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }

    calcularIdade() {
        const dataNascimento = new Date(this.dataNascimentoInput.value);
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const mes = hoje.getMonth() - dataNascimento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idade--;
        }
        
        this.idadeInput.value = idade;
    }

    salvarPaciente() {
        const formData = new FormData(this.formPaciente);
        const paciente = Object.fromEntries(formData.entries());
        
        // Recuperar pacientes existentes
        let pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        
        if (this.pacienteEditandoIndex !== null) {
            // Atualizar paciente existente
            pacientes[this.pacienteEditandoIndex] = paciente;
        } else {
            // Adicionar novo paciente
            pacientes.push(paciente);
        }
        
        // Salvar no localStorage
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
        
        // Limpar formulário e índice de edição
        this.formPaciente.reset();
        this.pacienteEditandoIndex = null;
        
        // Atualizar lista
        this.carregarPacientes();
        
        // Voltar para a lista
        document.getElementById('formulario-cadastro').classList.add('hidden');
        document.getElementById('lista-pacientes').classList.remove('hidden');
    }

    carregarPacientes() {
        const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        
        if (pacientes.length === 0) {
            if (this.tabelaPacientes) this.tabelaPacientes.innerHTML = '';
            if (this.semPacientes) this.semPacientes.classList.remove('hidden');
            return;
        }
        
        if (this.semPacientes) this.semPacientes.classList.add('hidden');
        if (!this.tabelaPacientes) return;
        
        this.tabelaPacientes.innerHTML = pacientes.map((paciente, index) => `
            <tr>
                <td>${paciente.nome}</td>
                <td>${this.formatarData(paciente.data_nascimento)}</td>
                <td>${paciente.idade}</td>
                <td>${paciente.email}</td>
                <td>${paciente.telefone}</td>
                <td>${paciente.nome_responsavel || '-'}</td>
                <td>${this.formatarEndereco(paciente)}</td>
                <td class="acoes">
                    <button onclick="pacientes.editarPaciente(${index})">Editar</button>
                    <button onclick="pacientes.excluirPaciente(${index})">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    formatarData(data) {
        if (!data) return '-';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    formatarEndereco(paciente) {
        const partes = [];
        if (paciente.logradouro) partes.push(paciente.logradouro);
        if (paciente.numero) partes.push(paciente.numero);
        if (paciente.bairro) partes.push(paciente.bairro);
        if (paciente.cidade) partes.push(paciente.cidade);
        if (paciente.uf) partes.push(paciente.uf);
        return partes.join(', ') || '-';
    }

    editarPaciente(index) {
        const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        const paciente = pacientes[index];
        
        // Guardar o índice do paciente sendo editado
        this.pacienteEditandoIndex = index;
        
        // Preencher formulário
        Object.keys(paciente).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = paciente[key];
                
                // Tratar campos especiais
                if (key === 'convenio') {
                    const camposConvenio = document.getElementById('campos-convenio');
                    if (paciente[key] === 'SIM') {
                        document.getElementById('convenio_sim').checked = true;
                        camposConvenio.classList.remove('hidden');
                    } else {
                        document.getElementById('convenio_nao').checked = true;
                        camposConvenio.classList.add('hidden');
                    }
                }
                
                if (key === 'periodo_atendimento') {
                    const quantidadeDias = document.getElementById('quantidade_dias');
                    if (paciente[key] === 'Determinado') {
                        document.getElementById('periodo_determinado').checked = true;
                        quantidadeDias.disabled = false;
                        quantidadeDias.required = true;
                    } else {
                        document.getElementById('periodo_indeterminado').checked = true;
                        quantidadeDias.disabled = true;
                        quantidadeDias.required = false;
                    }
                }
            }
        });
        
        // Mostrar formulário
        document.getElementById('lista-pacientes').classList.add('hidden');
        document.getElementById('formulario-cadastro').classList.remove('hidden');
    }

    excluirPaciente(index) {
        if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
        
        let pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        pacientes.splice(index, 1);
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
        
        this.carregarPacientes();
    }
}

// Criar instância da classe quando o documento estiver pronto
const pacientes = new Pacientes(); 