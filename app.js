const vm = new Vue({
  el: "#app",
  data: {
    // armazena os produtos recebidos através do fetch na API
    produtos: [],
    produto: false,
    carrinho: [],
    carrinhoAtivo: false,
    mensagemAlerta: "Item adicionado",
    alertaAtivo: false,
  },
  filters: {
    // serve para exibir o valor de acordo com a moeda e região informada
    numeroPreco(valor) {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  computed: {
    // serve para atualizar o valor do carrinho
    carrinhoTotal() {
      let total = 0;
      if (this.carrinho.length) {
        this.carrinho.forEach((item) => {
          total += item.preco;
        });
      }
      return total;
    },
  },
  methods: {
    // reponsável por puxar as informações dos produtos na API
    fetchProdutos() {
      fetch("./api/produtos.json")
        .then((r) => r.json())
        .then((r) => {
          this.produtos = r;
        });
    },
    // responsável por puxar as informações de um único produto de acordo com o ID passado no parâmetro
    fetchProduto(id) {
      fetch(`./api/produtos/${id}/dados.json`)
        .then((r) => r.json())
        .then((r) => {
          this.produto = r;
        });
    },
    // ao clicar no modal faz o fetch do produto clicado e também faz um scroll suave a partir do top da página
    abrirModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    // serve para fechar o modal quando ocorre um clique fora do modal
    fecharModal({ target, currentTarget }) {
      if (target === currentTarget) this.produto = false;
    },
    clickForaCarrinho({ target, currentTarget }) {
      if (target === currentTarget) this.carrinhoAtivo = false;
    },
    // serve para adicionar um item ao carrinho
    adicionarItem() {
      this.produto.estoque--;
      const { id, nome, preco } = this.produto;
      this.carrinho.push({ id, nome, preco });
      this.alerta(`${nome} foi adicionado ao carrinho`);
    },
    // serve para remover um item do carrinho de acordo com o index informado no parametro
    removerItem(index) {
      this.carrinho.splice(index, 1);
    },
    // caso exista algo no local storage, converte de volta para array e atribui a carrinho
    checarLocalStorage() {
      if (window.localStorage.carrinho) {
        this.carrinho = JSON.parse(window.localStorage.carrinho);
      }
    },
    // serve para exibir uma mensagem quando itens são adicionados ao carrinho
    alerta(mensagem) {
      this.mensagemAlerta = mensagem;
      this.alertaAtivo = true;
      setTimeout(() => {
        this.alertaAtivo = false;
      }, 1500);
    },
    compararEstoque() {
      const items = this.carrinho.filter(({ id }) => id === this.produto.id);
      this.produto.estoque -= items.length;
    },
    // serve para conseguir compartilhar o link do produto e ele aparecer aberto
    router() {
      const hash = document.location.hash;
      if (hash) {
        this.fetchProduto(hash.replace("#", ""));
      }
    },
  },
  watch: {
    // serve para salvar as informações do carrinho como string no local storage
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho);
    },
    // serve para mudar o titulo da página e a url toda vez que produto for alterado
    produto() {
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id || "";
      history.pushState(null, null, `#${hash}`);
      if (this.produto) {
        this.compararEstoque();
      }
    },
  },
  // será executado assim que o vueJs for criado
  created() {
    this.fetchProdutos();
    this.checarLocalStorage();
    this.router();
  },
});
