/**
 * @fileoverview Static Data Repository
 * @description This file contains the initialization of static data to be used when starting up application
 *
 * @author: Abdul Qawi Bin Kamran
 * @version: 0.0.1
 *
 */
import { STATUS, REACT_TYPES, USER_TYPES, TIMESTAMP_TYPES } from "../utils/constants.js";

class StaticDataInit {
  constructor(pool) {
    this.pool = pool;
  }

  async initializeStaticData() {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    await this._initStatus(connection);
    await this._initReactionType(connection);
    await this._initUserType(connection);
    await this._initTimestampType(connection);
    try {
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async _initStatus(connection) {
    try {
      const [result] = await connection.query(
        `select label from status where isActive = 1`,
        []
      );
      const existingStatuses = result.map((status) => status.label);
      if (existingStatuses.length === STATUS.length) {
        console.info('All STATUS are already initialized. No need to insert new ones.');
        return; 
      }
      const newStatuses = STATUS.filter(status => !existingStatuses.includes(status));
      if (newStatuses.length > 0) {
        const values = newStatuses.map(newStatus => `('${newStatus}', 1)`).join(', ');
        await connection.query(
          `
          insert into status (label, isActive)
          values ${values}
          `,
          []
          
        );
      }
    } catch (err) {
      throw err; 
    }
  }

  async _initReactionType(connection) {
    try {
      const [result] = await connection.query(
        `select label from reactiontype where isActive = 1`,
        []
      );
      const existingReactionTypes = result.map((reactionType) => reactionType.label);
      if (existingReactionTypes.length === REACT_TYPES.length) {
        console.info('All REACTION_TYPE are already initialized. No need to insert new ones.');
        return; 
      }
      const newReactionTypes = REACT_TYPES.filter(reactionType => !existingReactionTypes.includes(reactionType));
      if (newReactionTypes.length > 0) {
        const values = newReactionTypes.map(newReactionType => `('${newReactionType}', 1)`).join(', ');
        await connection.query(
          `
          insert into reactiontype (label, isActive)
          values ${values}
          `,
          []
        );
      }
    } catch (err) {
      throw err; 
    }
  }
  async _initUserType(connection) {
    try {
      const [result] = await connection.query(
        `select label from usertype where isActive = 1`,
        []
      );
      const existingUserTypes = result.map((userType) => userType.label);
      if (existingUserTypes.length === USER_TYPES.length) {
        console.info('All USER_TYPE are already initialized. No need to insert new ones.');
        return; 
      }
      const newUserTypes = USER_TYPES.filter(userType => !existingUserTypes.includes(userType));
      if (newUserTypes.length > 0) {
        const values = newUserTypes.map(newUserType => `('${newUserType}', 1)`).join(', ');
        await connection.query(
          `
          insert into usertype (label, isActive)
          values ${values}
          `,
          []
        );
      }
    } catch (err) {
      throw err; 
    }
  }

  async _initTimestampType(connection) {
    try {
      const [result] = await connection.query(
        `select label from timestamptype where isActive = 1`,
        []
      );
      const existingTimestampTypes = result.map((timestampType) => timestampType.label);
      if (existingTimestampTypes.length === TIMESTAMP_TYPES.length) {
        console.info('All TIMESTAMP_TYPE are already initialized. No need to insert new ones.');
        return; 
      }
      const newTimestampTypes = TIMESTAMP_TYPES.filter(timestampType => !existingTimestampTypes.includes(timestampType));
      if (newTimestampTypes.length > 0) {
        const values = newTimestampTypes.map(newTimestampType => `('${newTimestampType}', 1)`).join(', ');
        await connection.query(
          `
          insert into timestamptype (label, isActive)
          values ${values}
          `,
          []
        );
      }
    } catch (err) {
      throw err; 
    }
  }
}

export default StaticDataInit;
