export enum SFUMessageType {
    JOIN_ROOM = 'joinRoom',
    CREATE_PRODUCER_TRANSPORT = 'createProducerTransport',
    CONNECT_PRODUCER_TRANSPORT = 'connectProducerTransport',
    PRODUCE = 'produce',
    CREATE_CONSUMER_TRANSPORT = 'createConsumerTransport',
    CONNECT_CONSUMER_TRANSPORT = 'connectConsumerTransport',
    GET_PRODUCERS = 'getProducers',
    RESUME = 'resume',
    CONSUME = 'consume',
    PRODUCER_CONNECTED = 'producerConnected',
    PRODUCED = 'produced',
    CONSUMER_CONNECTED = 'consumerConnected',
    SUBSCRIBED = 'subscribed',
    NEW_PRODUCER = 'newProducer',
    ROOM_FULL = 'roomFull',
    PRODUCER_CLOSED = 'producerClosed',
    UNAUTHORIZED = 'unauthorized'
}