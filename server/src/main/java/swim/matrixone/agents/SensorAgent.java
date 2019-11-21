package swim.matrixone;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.structure.Value;

/**
 * The Sensor WebAgent handles the current state for 
 * one or more sensors. This includes both current value 
 * and  historic values
 */
public class SensorAgent extends AbstractAgent {

  // number of records to hold in the history lane.
  private static final int HISTORY_SIZE = 150;

  /**
   * ValueLane to hold the current sensor float value
   */
  @SwimLane("latest")
  ValueLane<Float> latest = this.<Float>valueLane();

  /**
   * Use map lane to store history of sensor data. 
   * Key: Long type of timestamp, Float: raw sensor value
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("history")
  MapLane<Long, Float> history = this.<Long, Float>mapLane()
    .didUpdate((key, newValue, oldValue) -> {
      if (this.history.size() > HISTORY_SIZE) {
        this.history.remove(this.history.getIndex(0).getKey());
      }
    });

  /**
   * command Lane to receive data from NodeJS data bridge
   */
  @SwimLane("addLatest")
  CommandLane<Float> addLatest = this.<Float>commandLane()
    .onCommand(i -> {
      // update latest value lane to store latest read-in value
      latest.set(i);
      final long now = System.currentTimeMillis();
      // update map lane with timestamp and read in data
      // notice: only last read in 5 minutes period will be stored
      history.put(now, i);
    });

}
