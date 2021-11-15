let lastID = null,
    gifter = '',
    giftCounter = 0,
    banList = /hoss00312.*/g;

function handlEvent(eventData) {  
    console.log('event came in')
    // Sometimes streamlabs double sends events, so ignore those
    if (
        eventData.message && 
        eventData.message[0] && 
        eventData.message[0].event_id && 
        lastID === eventData.message[0].event_id
    ) {
      return;
    } else if (eventData.message[0]){
      lastID = eventData.message[0].event_id;
    }

    // TODO Take in config so return strings can be customized
    // TODO Include Donation Event
    if (eventData.for === 'twitch_account') {
      let eventType = eventData.type.toLowerCase();
      const message = eventData.message[0];

      switch(eventType) {
        case 'follow':
          if (message.name.match(banList)) {
            return;
          }
          return `${message.name} has just followed!`;

        case 'subscription':
          if (message.sub_type === 'subgift') {
            // If we have a gifter we want to ignore the sub train in alerts
            if (message.gifter_display_name === gifter && giftCounter > 0) {
              giftCounter--;
              return;
            }
            return `${message.display_name} was gifted a sub by ${message.gifter_display_name}!`;
          } else if (message.sub_type === 'resub') {
            return `${message.name} has just resubscribed for ${message.months} months!`;
          } else {
            return `${message.name} has just subscribed!`;
          }

        case 'submysterygift':
          if (message.amount > 1) {
            gifter = message.gifter_display_name;
            giftCounter = parseInt(message.amount);
            return `${message.gifter_display_name} just gifted ${message.amount} subs! Why???`;
          }
          return;
          
        case 'host':
          return `${message.name} has hosted with ${message.viewers} viewers!`;

        case 'raid':
          return `${message.name} has raided with ${message.raiders} viewers!`;

        case 'bits':
          return `${message.name} has just thrown ${message.amount} pennies at the maid!`;

        default:
          return;
      }
    }
  }

module.exports = handlEvent;
