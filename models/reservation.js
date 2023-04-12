/** Reservation for Lunchly */

const moment = require("moment");
//moment() allows displaying dates in a more readable format

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }
//method for setting number of guests
  set numGuests(val){
    if (val < 1) 
      throw new Error("Number of guests must be at least 1");
    this._numGuests = val;
    }
  
//method for getting number of guests
  get numGuests(){
    return this._numGuests;
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }
 
  //get reservation by id
  static async get(id){
    const result = await db.query(
      `SELECT id, customer_id AS "customerId" , num_guests AS "numGuests", 
      start_at AS "startAt", 
      FROM reservations WHERE id = $1`,
      [id]
    );

    let reservation = results.rows[0];

    if(reservation === undefined){
      throw new Error(`Reservation with id ${id} not found`);
    }
    return new Reservation(reservation);
  }



  /* This either adds a new reservation if they’re new,
   or updates the existing record if there are changes.*/
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_Id, num_guests, start_At, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3
             WHERE id=$4`,
        [this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}


module.exports = Reservation;
