
const { createApp } = Vue;

createApp({
	computed: {
		connected() {
			return !!this.address;
		},
		compressed_address() {
			return this.address.slice(0,6) + '...' + this.address.slice(-4);
		},
		random_color(){
			return '#'+this.address.slice(2,8);
		},
		extended() {
			return this.connected && (!this.layer || this.layer === 'main');
		}
	},
	async mounted() {
		this.proposals = await this.getProposals();
	},
	data: () => ({
		address: null,
		totalVotes: 0,
		usedVotes: 0,

		proposals: [],

		layer: null,

		proposalId : null,
		proposal : {
			title: '',
			address: '',
			schedule: '',
			content: '',
			agree_percent: '',
			disagree_percent: '',
			status: '',
		},

		title: '',
		content: '',
		end_date: '',

	}),
	methods: {
		async connect() {

			console.log('connect()');

			if(!window.ethereum){
				window.open('https://metamask.io/');
				return;
			}
			
			this.web3 = new Web3(window.ethereum);

			const [ address ] = await this.web3.eth.requestAccounts();	

			this.address = address;
			this.totalVotes = await this.getTotalVotes(address);

			if(this.proposalId) {
				this.usedVotes = await this.getUsedVotes(this.address, this.proposalId);
			}

			this.checkId = setInterval(this.checkAddress, 1000);
		},
		async openProposal(id) {

			this.proposal = await this.getProposalById(id);

			if(this.address) {
				this.usedVotes = await this.getUsedVotes(this.address, id);
			}

			this.proposalId = id;
			this.layer = 'proposal-detail';
		},
		async getTotalVotes(address) {

			const { data } = await axios.get('/api/vote/sum', {params: {address}});
			const { sumOfVoteNum } = data;

			return sumOfVoteNum;
		},
		async getUsedVotes(address, proposal_id) {

			const { data } = await axios.get('/api/vote/sum/used', {params: {address, proposal_id}});
			const { sumOfVoteNum } = data;

			return sumOfVoteNum;

		},
		async getProposals() {
			const { data } = await axios.get('/api/proposal/list');
			const { proposals } = data;

			for(let i = 0; i < proposals.length; i++){
				proposals[i].dday = this.diff(proposals[i].end_date) === 0 ? 'D-DAY' : 'D-' + this.diff(proposals[i].end_date);
				proposals[i].is_dday = proposals[i].dday === 'D-DAY'
				proposals[i].schedule = this.convert(proposals[i].start_date) + ' ~ ' + this.convert(proposals[i].end_date)
			}

			console.log(proposals);

			return proposals;
		},
		async getProposalById(id) {
			const { data } = await axios.get('/api/proposal', {params: {id}});
			const { proposal } = data;

			proposal.agree = parseInt(proposal.agree)
			proposal.disagree = parseInt(proposal.disagree)

			proposal.agree_percent = proposal.agree === 0 ? 0 : Math.floor(proposal.agree * 100 / (proposal.agree + proposal.disagree)) + '%';
			proposal.disagree_percent = proposal.disagree === 0 ? 0 : Math.floor(proposal.disagree * 100 / (proposal.agree + proposal.disagree)) + '%';

			return proposal;
		},
		convert(dateString) {
			const date = new Date(dateString);
			date.setHours(date.getHours() + 9);

			return date.toISOString().substring(0, 10);
		},
		diff(dateString) {
			const date = new Date(dateString);
			const now = new Date();

			const diffms = date.getTime() - now.getTime();

			return Math.floor(diffms / (1000 * 60 * 60 * 24));
		},
		async vote(agree) {

			console.log("vote", agree);

			if(!this.address || !this.totalVotes) return;

			const message = 'Welcome to the Crazy Rich Yellows proposal page\n\nClick sign to confirm your final vote, your vote will be reflected automatically as you click sign\nThis request will not trigger a blockchain transaction or cost any gas gees\n\nWallet address: ' + this.address;

			this.web3.eth.personal.sign(message, this.address, async (err, result) => {
				if(err) {
					console.log(err);
					return;
				}

				try {
					await axios.post('/api/vote', {
						proposal_id: this.proposalId,
						address: this.address,
						agree,
						signature: result,
					});
				}
				catch (e) {
					console.log(e);

					alert('unexpected error occurred. please contact CRY team');

					return;
				}

				alert('Voted Successfully!');

				await this.openProposal(this.proposalId);
			});
		},
		async submit() {

			if(!this.address || !this.title || !this.end_date || !this.content) return;

			if(this.diff(this.end_date) < 3) {
				alert('Voting ends too early.')
				return;
			}

			const message = 'Welcome to the Crazy Rich Yellows proposal page\n\nClick sign to confirm your proposal, your proposal will be reflected automatically as you click sign\nThis request will not trigger a blockchain transaction or cost any gas gees\n\nWallet address: ' + this.address;

			this.web3.eth.personal.sign(message, this.address, async (err, result) => {
				if(err) {
					console.log(err);
					return;
				}

				try {
					await axios.post('/api/proposal', {
						address: this.address,
						title: this.title, 
						content: this.content,
						end_date: this.end_date,
						signature: result,
					});
				}
				catch (e) {
					console.log(e);

					alert('unexpected error occurred. please contact CRY team');

					return;
				}

				alert('Proposal Created Successfully!');

				this.layer = null;
				this.proposals = await this.getProposals();
			});
		},
		async openCreateProposal() {
			if(this.totalVotes < 9) {
				alert('You needs 9 or more Votes to create a proposal');
				return;
			}
			this.layer = 'create-proposal'
		}
	},
}).mount('#app');

