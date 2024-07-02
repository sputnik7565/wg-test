class GameLogic {
    constructor(player, monster, cards) {
        this.player = player;
        this.monster = monster;
        this.cards = cards;
        this.playerTurn = true;
        this.turnOrderMessage = '';

        this.step01 = document.getElementById('step-01');
        this.step02 = document.getElementById('step-02');
        this.step021 = document.getElementById('step-02-1');
        this.step03 = document.getElementById('step-03');
        this.battleLog = document.getElementById('battle-log');
        this.cardGroupDiv = document.getElementById('card-group');
        this.selectedCardsDiv = document.getElementById('selected-cards');
        this.damageLog = document.getElementById('damage-log');
    }

    startBattle() {
        this.step01.classList.remove('active');
        this.step02.classList.add('active');
        this.determineTurnOrder();
        this.populatePlayerChoices();
        this.updateStatus();
    }

    determineTurnOrder() {
        if (this.player.agility > this.monster.agility) {
            this.playerTurn = true;
            this.turnOrderMessage = '플레이어의 민첩 수치가 높아 먼저 행동합니다.';
        } else if (this.player.agility < this.monster.agility) {
            this.playerTurn = false;
            this.turnOrderMessage = '몬스터의 민첩 수치가 높아 먼저 행동합니다.';
        } else {
            this.playerTurn = Math.random() >= 0.5;
            this.turnOrderMessage = this.playerTurn ? '민첩 수치가 같아 랜덤으로 플레이어가 먼저 행동합니다.' : '민첩 수치가 같아 랜덤으로 몬스터가 먼저 행동합니다.';
        }
    }

    populatePlayerChoices() {
        this.cardGroupDiv.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.textContent = `Card ${i}`;
            card.addEventListener('click', () => this.selectCard(card, i));
            this.cardGroupDiv.appendChild(card);
        }
    }

    selectCard(card, index) {
        if (card.classList.contains('disabled')) return;

        const type = index === 1 ? 'adjective' : index === 2 ? 'skill' : 'result';
        Array.from(this.cardGroupDiv.children).forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const randomContent = this.getRandomCardContent(type);
        card.textContent = `Card ${index} - ${randomContent.name}`;
        card.classList.add('disabled');
        this.player.selection[type] = randomContent;

        if (this.player.selection.adjective && this.player.selection.skill && this.player.selection.result) {
            this.step02.classList.remove('active');
            this.step021.classList.add('active');
            this.displaySelectedCards();
        }
    }

    getRandomCardContent(type) {
        if (type === 'adjective') {
            return this.cards.adjectives[Math.floor(Math.random() * this.cards.adjectives.length)];
        } else if (type === 'skill') {
            return this.cards.skills[Math.floor(Math.random() * this.cards.skills.length)];
        } else {
            return this.cards.results[Math.floor(Math.random() * this.cards.results.length)];
        }
    }

    displaySelectedCards() {
        this.selectedCardsDiv.innerHTML = `
            <div class="card">${this.player.selection.adjective.name}</div>
            <div class="card">${this.player.selection.skill.name}</div>
            <div class="card">${this.player.selection.result.name}</div>
        `;
    }

    drawCards() {
        if (!this.player.selection.adjective || !this.player.selection.skill || !this.player.selection.result) {
            alert('Please select a card from each group.');
            return;
        }

        this.step021.classList.remove('active');
        this.step03.classList.add('active');

        const monsterCards = this.drawRandomCards(this.cards);

        let playerResult, monsterResult;
        if (this.playerTurn) {
            playerResult = this.generateResult(this.player.selection, this.player, this.monster, true);
            monsterResult = this.generateResult(monsterCards, this.monster, this.player, false);
        } else {
            monsterResult = this.generateResult(monsterCards, this.monster, this.player, false);
            playerResult = this.generateResult(this.player.selection, this.player, this.monster, true);
        }

        this.damageLog.innerHTML = `<p>데미지 계산 로그:</p><p>${playerResult.damageLog}</p><p>${monsterResult.damageLog}</p>`;
        this.battleLog.innerHTML = `<p>${this.turnOrderMessage}</p><p>플레이어는 ${playerResult.log}</p><p>몬스터는 ${monsterResult.log}</p>`;

        this.updateStats(playerResult, monsterResult);
        this.updateStatus();

        if (this.player.hp <= 0 || this.monster.hp <= 0) {
            this.battleLog.innerHTML += `<p>전투가 종료되었습니다. ${this.player.hp <= 0 ? '플레이어' : '몬스터'}가 패배했습니다.</p>`;
            document.getElementById('next-turn-button').disabled = true;
        }
    }

    drawRandomCards(cards) {
        return {
            adjective: cards.adjectives[Math.floor(Math.random() * cards.adjectives.length)],
            skill: cards.skills[Math.floor(Math.random() * cards.skills.length)],
            result: cards.results[Math.floor(Math.random() * cards.results.length)]
        };
    }

    generateResult(cards, attacker, defender, isPlayer) {
        let log = `${cards.adjective.name} ${cards.skill.name} ${cards.result.name}`;
        let damageLog = isPlayer ? '플레이어 데미지 계산: ' : '몬스터 데미지 계산: ';
        let damage = 0;
        let effect = '';

        if (cards.result.success === false) {
            damageLog += `스킬이 실패했습니다.\n`;
            return { log, damageLog, damage, effect };
        }

        if (cards.skill.baseDamage) {
            if (cards.skill.type === 'magic') {
                damage = (cards.skill.baseDamage + attacker.intelligence) * (cards.adjective.multiplier || 1);
                damageLog += `기본 데미지: ${cards.skill.baseDamage}, 지능 보너스: ${attacker.intelligence}, 배수: ${(cards.adjective.multiplier || 1)}, 마법 방어력: ${defender.magicDefense}\n`;
                damage = Math.max(0, damage - defender.magicDefense);
            } else {
                damage = (cards.skill.baseDamage + attacker.strength) * (cards.adjective.multiplier || 1);
                damageLog += `기본 데미지: ${cards.skill.baseDamage}, 근력 보너스: ${attacker.strength}, 배수: ${(cards.adjective.multiplier || 1)}, 물리 방어력: ${defender.physicalDefense}\n`;
                damage = Math.max(0, damage - defender.physicalDefense);
            }
            damageLog += `최종 데미지: ${damage}\n`;
        }

        if (cards.result.doubleEffect) {
            damage *= 2;
            damageLog += `두 배 효과 적용 후 데미지: ${damage}\n`;
        }

        if (cards.result.reducedEffect) {
            damage *= cards.result.reducedEffect;
            damageLog += `감소된 효과 적용 후 데미지: ${damage}\n`;
        }

        if (cards.skill.effect) {
            effect = cards.skill.effect;
        }

        if (cards.result.selfInflict) {
            log += ` (자신에게 ${damage} 피해)`;
            attacker.hp -= damage;
        } else {
            if (cards.skill.heal) {
                log += ` (${cards.skill.heal} 치유)`;
                attacker.hp += cards.skill.heal;
                damageLog += `체력 증가: ${cards.skill.heal}\n`;
            } else {
                log += ` (${damage} 피해)`;
                defender.hp -= damage;
            }
        }

        return { log, damageLog, damage, effect };
    }

    updateStats(playerResult, monsterResult) {
        if (playerResult.effect) {
            this.applyEffect(playerResult.effect, this.monster);
        }
        if (monsterResult.effect) {
            this.applyEffect(monsterResult.effect, this.player);
        }
    }

    applyEffect(effect, stats) {
        switch (effect) {
            case 'freeze':
                // 동결 효과 처리
                break;
            case 'stun':
                // 마비 효과 처리
                break;
            case 'poison':
                stats.hp -= 5; // 독 데미지 예시
                break;
            // 추가 효과 처리
        }
    }

    updateStatus() {
        document.getElementById('player-hp').textContent = this.player.hp;
        document.getElementById('player-strength').textContent = this.player.strength;
        document.getElementById('player-intelligence').textContent = this.player.intelligence;
        document.getElementById('player-agility').textContent = this.player.agility;
        document.getElementById('player-physical-defense').textContent = this.player.physicalDefense;
        document.getElementById('player-magic-defense').textContent = this.player.magicDefense;

        document.getElementById('monster-hp').textContent = this.monster.hp;
        document.getElementById('monster-strength').textContent = this.monster.strength;
        document.getElementById('monster-intelligence').textContent = this.monster.intelligence;
        document.getElementById('monster-agility').textContent = this.monster.agility;
        document.getElementById('monster-physical-defense').textContent = this.monster.physicalDefense;
        document.getElementById('monster-magic-defense').textContent = this.monster.magicDefense;
    }

    nextTurn() {
        this.step03.classList.remove('active');
        this.step02.classList.add('active');
        this.player.selection = { adjective: null, skill: null, result: null };
        this.determineTurnOrder();
        this.populatePlayerChoices();
    }
}
