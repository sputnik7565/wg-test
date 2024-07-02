class Player {
    constructor(data) {
        this.name = data.name;
        this.hp = data.hp;
        this.strength = data.strength;
        this.intelligence = data.intelligence;
        this.agility = data.agility;
        this.physicalDefense = data.physicalDefense;
        this.magicDefense = data.magicDefense;
        this.selection = {
            adjective: null,
            skill: null,
            result: null
        };
    }

    // 추가적인 메소드 및 플레이어 행동 정의
}
