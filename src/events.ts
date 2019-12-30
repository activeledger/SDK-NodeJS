// @ts-ignore
import { EventEmitter } from "events";
import EventSource = require("eventsource");
import { IEventConfig, IEventListeners } from "./interfaces";

/**
 * This class is used for easy access to the events API provided by the ActiveCore server
 *
 * @export
 * @class LedgerEvents
 */
export class LedgerEvents {
  public errorEvents: EventEmitter;

  /**
   * Holds referenced listeners
   *
   * @private
   * @type {IEventListeners}
   * @memberof LedgerEvents
   */
  private listeners: IEventListeners = {};

  /**
   * Incremental reference identifier for listeners
   *
   * @private
   * @memberof LedgerEvents
   */
  private reference = 1;

  /**
   * Creates an instance of LedgerEvents.
   * @param {string} url - The ActiveCore URL
   * @memberof LedgerEvents
   */
  constructor(private url: string) {
    // Check that the url has the correct protocol
    if (!(this.url.startsWith("http") || this.url.startsWith("https"))) {
      throw new Error("Activecore URL must include http:// or https://");
    }

    // We add the / so remove if found
    if (this.url.endsWith("/")) {
      this.url = this.url.substring(0, this.url.lastIndexOf("/") - 1);
    }

    // Is api part of the path
    if (!this.url.endsWith("api")) {
      this.url += "/api";
    }

    this.errorEvents = new EventEmitter();
  }

  /**
   * Subscribe to all Activity events
   *
   * /activity/subscribe - Recieve notifications for all activities on the ledger network.
   *
   * @param {Function} callback
   * @memberof LedgerEvents
   */
  public subscribeToActivity(callback: Function): number;
  /**
   * Subscribe to Activity events triggered by a specific stream
   *
   * activity/subscribe/{streamId} - Recieve notifications for this specific stream
   *
   * @param {string} streamId
   * @param {Function} callback
   * @returns {number}
   * @memberof LedgerEvents
   */
  public subscribeToActivity(streamId: string, callback: Function): number;
  public subscribeToActivity(streamIdOrCallback: string | Function, callback?: Function): number {
    // Keep a copy because we need to use it to store the event source and we need to return it to the caller
    const internalReference = this.reference;
    this.reference++;

    let streamId = null;

    typeof streamIdOrCallback === "string" ? (streamId = streamIdOrCallback) : (callback = streamIdOrCallback);
    if (!callback) throw new Error("No Callback defined");

    // Build the resource part of the URL
    const resource = streamId ? `activity/subscribe/${streamId}` : "activity/subscribe";

    const eventSource = new EventSource(`${this.url}/${resource}`);

    eventSource.onerror = (error: MessageEvent) => {
      this.errorEvents.emit("ledgerEventError", error);
      //this.unsubscribe(internalReference);
    };

    eventSource.addEventListener("message", (event: any) => {
      const data = JSON.parse(event.data);

      callback!(data.stream);
    });

    this.listeners[internalReference] = eventSource;
    return internalReference;
  }

  /**
   * Subscribe to contract specific events
   *
   * 1. /events - Subscribe to all contract events sent on the ledger
   * 2. /events/{config.contract} - Subscribe to events emitted by this contract only
   * 3. /events/{config.contract}/{config.event} - Subscribe to a specific event in a specific contract
   *
   * @param {Function} callback
   * @param {IEventConfig} config
   * @memberof LedgerEvents
   */
  public subscribeToEvent(callback: Function, config?: IEventConfig): number {
    // Keep a copy because we need to use it to store the event source and we need to return it to the caller
    const internalReference = this.reference;
    this.reference++;

    // Check that contract is definied when event is, if it isn't throw an error

    // Build the resource part of the URL
    let resource = "events";

    if (config) {
      // Event cannot be used without a contract reference
      if (config.event && !config.contract) throw new Error("Must pass contract to use event");
      if (config.contract) resource += `/${config.contract}`;
      if (config.event) resource += `/${config.event}`;
    }

    const eventSource = new EventSource(`${this.url}/${resource}`);

    eventSource.onerror = (error: MessageEvent) => {
      this.errorEvents.emit("ledgerEventError", error);
      //this.unsubscribe(internalReference);
    };

    eventSource.addEventListener("message", (event: any) => {
      const data = JSON.parse(event.data);

      callback!(data.event.data);
    });

    this.listeners[internalReference] = eventSource;
    return internalReference;
  }

  /**
   * Close a connection and remove it from the listeners
   *
   * @param {number} id
   * @returns {boolean}
   * @memberof LedgerEvents
   */
  public unsubscribe(id: number): boolean {
    // If anything at all goes wrong just return false
    try {
      // Remove the listener from the listeners array
      const eventSource = this.listeners[id];
      // Close the event connection
      eventSource.close();
      // Delete Reference
      delete this.listeners[id];
      return true;
    } catch (error) {
      return false;
    }
  }
}
