package swim.matrixone;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.json.Json;
import swim.structure.Record;
import swim.structure.Value;


/**
 * The NFC WebAgent handles NFC tag data read
 * in by Matrix Board
 */
public class NfcAgent extends AbstractAgent {

    // number of records to hold in the history lane.
    private static final int HISTORY_SIZE = 150;

    /**
     * ValueLane to hold the current nfc read code
     */
    @SwimLane("code")
    ValueLane<Integer> code = this.<Integer>valueLane();

    /**
     * ValueLane to hold the raw nfc tag data
     */
    @SwimLane("rawTagData")
    ValueLane<Value> rawTagData = this.<Value>valueLane()
        .didSet((newData, oldData) -> {
            System.out.println(newData);
        });


    @SwimLane("info")
    ValueLane<Value> info = this.<Value>valueLane();
  
    @SwimLane("content")
    ValueLane<Value> content = this.<Value>valueLane();

    @SwimLane("pages")
    ValueLane<Value> pages = this.<Value>valueLane();

    /**
     * Use map lane to store history of nfc reads. 
     */
    @SwimLane("history")
    MapLane<Long, Record> history = this.<Long, Record>mapLane()
        .didUpdate((key, newValue, oldValue) -> {
        if (this.history.size() > HISTORY_SIZE) {
            this.history.remove(this.history.getIndex(0).getKey());
        }
        });

    /**
     * command Lane to receive data from NodeJS data bridge
     */
    @SwimLane("updateNfcData")
    CommandLane<String> updateNfcData = this.<String>commandLane()
        .onCommand((msgString) -> {
            Value readData = Json.parse(msgString);
            Integer readCode = readData.get("code").intValue();
            Value tagInfo = readData.get("info");
            Value tagPages = readData.get("pages");

            System.out.println("update nfc data");
            System.out.println(readCode);

            code.set(readCode);
            rawTagData.set(readData);
            info.set(tagInfo);
            pages.set(tagPages);

            // latest.set(i);
            // history.put(System.currentTimeMillis(), readData);
        });

    /**
     * Init one time when agent start
     */
    @Override
    public void didStart() {
        System.out.println("NFC Agent Started");
    }    
}
