
  // public setParty(party: Party): void {
  //   (this as any).party = party;
  // }

  // /**
  //  * The person sits down at the specified table if possible. Throws an
  //  * exception if they were already sitting there or somewhere else, or
  //  * if the table is full.
  //  */
  // public sitDown(table: Table) : void {
  //   if (this.current_table === table) { 
  //     throw new Error(`${this.name} is already sitting at table ${table.id}!`);
  //   }

  //   if (this.current_table) {
  //     throw new Error(`${this.name} is already sitting at another table!`);
  //   }

  //   if (!table.addPatron(this)) {
  //     throw new Error(`Table ${table.id} is full!`);
  //   }

  //   this.current_table = table;
  // }

  // /**
  //  * The person leaves the specified table.
  //  * Throws an exception if they weren't actually sitting there.
  //  */
  // public leaveTable(table: Table) : void {
  //   if (this.current_table !== table) {
  //     throw new Error(`${this.name} wasn't sitting here!`);
  //   }
  //   else {
  //     this.current_table = undefined;
  //   }
  // }