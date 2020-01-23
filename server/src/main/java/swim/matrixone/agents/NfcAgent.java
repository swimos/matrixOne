package swim.matrixone;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.json.Json;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;


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
            // System.out.println(newData);
        });


    @SwimLane("info")
    ValueLane<Value> info = this.<Value>valueLane();
  
    @SwimLane("content")
    ValueLane<Value> content = this.<Value>valueLane();

    @SwimLane("pages")
    ValueLane<Value> pages = this.<Value>valueLane();

    @SwimLane("payload")
    ValueLane<Value> payload = this.<Value>valueLane();

    @SwimLane("records")
    ValueLane<Value> records = this.<Value>valueLane();

    /**
     * Use map lane to store history of nfc reads. 
     */
    @SwimLane("history")
    MapLane<Long, Value> history = this.<Long, Value>mapLane()
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
            Value ndefPayload = readData.get("decodedPayload");
            Value ndefRecords = readData.get("ndefRecord");

            // System.out.println("update nfc data");
            // System.out.println(readCode);

            code.set(readCode);
            rawTagData.set(readData);
            info.set(tagInfo);
            pages.set(tagPages);
            payload.set(ndefPayload);
            records.set(ndefRecords);

            history.put(System.currentTimeMillis(), readData);

            command(Uri.parse("warp://127.0.0.1:9001"), Uri.parse("/settings/animation"), Uri.parse("setLedAnimation"), Value.fromObject("rainbowFadeIn")); 

        });

    /**
     * Init one time when agent start
     */
    @Override
    public void didStart() {
        System.out.println("NFC Agent Started");
    }    
}
