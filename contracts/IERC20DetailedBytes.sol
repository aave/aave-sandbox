pragma solidity 0.6.12;

interface IERC20DetailedBytes {
    function symbol() external view returns (bytes32);

    function name() external view returns (bytes32);
}
